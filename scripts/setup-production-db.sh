#!/bin/bash

# =============================================================================
# Production Database Setup Script
# =============================================================================
# This script sets up the database for production deployment on AWS
# 
# Prerequisites:
#   - AWS RDS PostgreSQL instance running
#   - Security group configured to allow EC2/ECS access
#   - Environment variables configured (via .env.production or AWS Systems Manager)
#
# Usage:
#   chmod +x scripts/setup-production-db.sh
#   ./scripts/setup-production-db.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Production Database Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Load environment variables
if [ -f .env.production ]; then
    echo -e "${GREEN}✓${NC} Loading .env.production"
    export $(cat .env.production | grep -v '^#' | xargs)
elif [ -f .env.local ]; then
    echo -e "${YELLOW}⚠${NC} Using .env.local (development settings)"
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo -e "${RED}✗${NC} No environment file found"
    echo -e "  Create .env.production from .env.production.example"
    exit 1
fi

# Validate required environment variables
REQUIRED_VARS=("AWS_RDS_HOST" "AWS_RDS_DATABASE" "AWS_RDS_USER" "AWS_RDS_PASSWORD")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}✗${NC} Missing required environment variables:"
    printf '  - %s\n' "${MISSING_VARS[@]}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment variables validated"
echo -e "  Host: ${AWS_RDS_HOST}"
echo -e "  Database: ${AWS_RDS_DATABASE}"
echo -e "  User: ${AWS_RDS_USER}\n"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗${NC} Node.js is not installed"
    echo -e "  Install Node.js 20+ to continue"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js found: $(node --version)\n"

# Run the database setup script
echo -e "${BLUE}Running database setup...${NC}\n"

if node scripts/setup-database.js; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  Database Setup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    echo -e "Next steps:"
    echo -e "  1. Build the application: ${BLUE}npm run build${NC}"
    echo -e "  2. Start production server: ${BLUE}npm start${NC}"
    echo -e "  3. Or deploy to AWS ECS/EC2\n"
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}  Database Setup Failed${NC}"
    echo -e "${RED}========================================${NC}\n"
    echo -e "Troubleshooting:"
    echo -e "  1. Check AWS RDS security group allows your IP"
    echo -e "  2. Verify RDS is accessible from this instance"
    echo -e "  3. Check credentials in environment file"
    echo -e "  4. Review logs above for specific errors\n"
    exit 1
fi
