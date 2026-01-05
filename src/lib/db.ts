import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

// Database connection pool
let pool: Pool | null = null

// Connection retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

// Logging utility
const log = {
  info: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DB INFO] ${message}`, meta || '')
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[DB ERROR] ${message}`, error || '')
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[DB WARN] ${message}`, meta || '')
  }
}

// Check if we have valid database credentials (DATABASE_URL or AWS RDS)
export const hasDBConfig = (): boolean => {
  return !!(
    process.env.DATABASE_URL ||
    (process.env.AWS_RDS_HOST &&
    process.env.AWS_RDS_DATABASE &&
    process.env.AWS_RDS_USER &&
    process.env.AWS_RDS_PASSWORD)
  )
}

// Get or create database pool
export const getPool = (): Pool => {
  if (!pool) {
    if (!hasDBConfig()) {
      throw new Error('Database configuration is missing. Please set DATABASE_URL or AWS_RDS_* environment variables.')
    }

    // Support DATABASE_URL (Supabase, Neon, etc.) or individual AWS RDS vars
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
        idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
        connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10000'),
        ssl: process.env.NODE_ENV === 'production' ? { 
          rejectUnauthorized: false // Supabase requires this
        } : false,
        statement_timeout: 60000,
        query_timeout: 60000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      })
    } else {
      pool = new Pool({
        host: process.env.AWS_RDS_HOST,
        port: parseInt(process.env.AWS_RDS_PORT || '5432'),
        database: process.env.AWS_RDS_DATABASE,
        user: process.env.AWS_RDS_USER,
        password: process.env.AWS_RDS_PASSWORD,
        max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
        idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
        connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10000'),
        ssl: process.env.AWS_RDS_SSL === 'true' ? { 
          rejectUnauthorized: false
        } : false,
        statement_timeout: 60000,
        query_timeout: 60000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      })
    }

    pool.on('error', (err) => {
      log.error('Unexpected database pool error', err)
    })

    pool.on('connect', () => {
      log.info('New database connection established')
    })

    pool.on('remove', () => {
      log.info('Database connection removed from pool')
    })

    log.info('Database connection pool created', {
      host: process.env.DATABASE_URL ? 'CONNECTION_STRING' : process.env.AWS_RDS_HOST,
      database: process.env.DATABASE_URL ? 'CONNECTION_STRING' : process.env.AWS_RDS_DATABASE,
      max: pool.options.max
    })
  }

  return pool
}

// Execute a query with automatic connection management and retry logic
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
  retries = MAX_RETRIES
): Promise<QueryResult<T>> {
  if (!hasDBConfig()) {
    throw new Error('Database not configured')
  }

  const pool = getPool()
  let client: PoolClient | null = null

  try {
    client = await pool.connect()
    const startTime = Date.now()
    const result = await client.query<T>(text, params)
    const duration = Date.now() - startTime
    
    if (duration > 1000) {
      log.warn(`Slow query detected (${duration}ms)`, { text, params })
    }
    
    log.info(`Query executed in ${duration}ms`)
    return result
  } catch (error: any) {
    log.error('Query execution failed', { text, params, error: error.message })
    
    // Retry logic for transient errors
    if (retries > 0 && isTransientError(error)) {
      log.warn(`Retrying query (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`, { text })
      await sleep(RETRY_DELAY)
      return query<T>(text, params, retries - 1)
    }
    
    throw error
  } finally {
    if (client) {
      client.release()
    }
  }
}

// Helper function to identify transient errors
function isTransientError(error: any): boolean {
  const transientCodes = [
    '57P03', // cannot_connect_now
    '53300', // too_many_connections
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
  ]
  
  // Also retry on connection timeout and network errors
  const errorMessage = error.message?.toLowerCase() || ''
  const isConnectionError = 
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('enotfound') ||
    errorMessage.includes('etimedout')
  
  return transientCodes.includes(error.code) || isConnectionError
}

// Helper function for delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Execute a transaction
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  if (!hasDBConfig()) {
    throw new Error('Database not configured')
  }

  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Database helper functions
export const db = {
  // SELECT query
  async select<T extends QueryResultRow = any>(
    table: string,
    columns: string = '*',
    where?: { [key: string]: any },
    orderBy?: string,
    limit?: number
  ): Promise<T[]> {
    let sql = `SELECT ${columns} FROM ${table}`
    const params: any[] = []
    let paramCount = 1

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map((key) => {
        params.push(where[key])
        return `${key} = $${paramCount++}`
      })
      sql += ` WHERE ${conditions.join(' AND ')}`
    }

    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`
    }

    if (limit) {
      sql += ` LIMIT ${limit}`
    }

    const result = await query<T>(sql, params)
    return result.rows
  },

  // INSERT query
  async insert<T extends QueryResultRow = any>(
    table: string,
    data: { [key: string]: any }
  ): Promise<T[]> {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')

    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`
    const result = await query<T>(sql, values)
    return result.rows
  },

  // UPDATE query
  async update<T extends QueryResultRow = any>(
    table: string,
    data: { [key: string]: any },
    where: { [key: string]: any }
  ): Promise<T[]> {
    const dataKeys = Object.keys(data)
    const dataValues = Object.values(data)
    let paramCount = 1

    const setClause = dataKeys
      .map((key) => `${key} = $${paramCount++}`)
      .join(', ')

    const whereKeys = Object.keys(where)
    const whereValues = Object.values(where)
    const whereClause = whereKeys
      .map((key) => `${key} = $${paramCount++}`)
      .join(' AND ')

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`
    const result = await query<T>(sql, [...dataValues, ...whereValues])
    return result.rows
  },

  // DELETE query
  async delete(
    table: string,
    where: { [key: string]: any }
  ): Promise<number> {
    const keys = Object.keys(where)
    const values = Object.values(where)
    const conditions = keys.map((key, i) => `${key} = $${i + 1}`)

    const sql = `DELETE FROM ${table} WHERE ${conditions.join(' AND ')}`
    const result = await query(sql, values)
    return result.rowCount || 0
  },

  // Search with ILIKE
  async search<T extends QueryResultRow = any>(
    table: string,
    searchColumn: string,
    searchTerm: string,
    columns: string = '*',
    orderBy?: string,
    limit?: number
  ): Promise<T[]> {
    let sql = `SELECT ${columns} FROM ${table} WHERE ${searchColumn} ILIKE $1`

    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`
    }

    if (limit) {
      sql += ` LIMIT ${limit}`
    }

    const result = await query<T>(sql, [`%${searchTerm}%`])
    return result.rows
  },

  // Custom query
  async custom<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<T[]> {
    const result = await query<T>(sql, params)
    return result.rows
  },

  // Call stored procedure
  async callProcedure<T extends QueryResultRow = any>(
    procedureName: string,
    params: any[]
  ): Promise<T[]> {
    const placeholders = params.map((_, i) => `$${i + 1}`).join(', ')
    const sql = `SELECT * FROM ${procedureName}(${placeholders})`
    const result = await query<T>(sql, params)
    return result.rows
  },
}

// Close the pool (for graceful shutdown)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Export types from pg for convenience
export type { Pool, PoolClient, QueryResult } from 'pg'
