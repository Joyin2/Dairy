#!/bin/bash

# AWS Infrastructure Setup for Dairy Management System
# This script sets up the complete AWS infrastructure for production deployment

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="612069931695"
PROJECT_NAME="dairy-app"
VPC_ID="vpc-025b3915da6601ec1"  # Your existing VPC
RDS_ENDPOINT="dairyproject.c4bcgmceqsoh.us-east-1.rds.amazonaws.com"
RDS_DB_NAME="dairy_management"

echo "🏗️  Setting up AWS Infrastructure..."

# Step 1: Create ECS Cluster
echo "📦 Creating ECS Cluster..."
aws ecs create-cluster \
  --cluster-name dairy-cluster \
  --region ${AWS_REGION} \
  --tags key=Project,value=DairyManagement || echo "Cluster may already exist"

# Step 2: Create CloudWatch Log Group
echo "📊 Creating CloudWatch Log Group..."
aws logs create-log-group \
  --log-group-name /ecs/dairy-app \
  --region ${AWS_REGION} || echo "Log group may already exist"

# Step 3: Create ECR Repository
echo "📚 Creating ECR Repository..."
aws ecr create-repository \
  --repository-name dairy-app \
  --region ${AWS_REGION} \
  --image-scanning-configuration scanOnPush=true || echo "Repository may already exist"

# Step 4: Create Application Load Balancer Security Group
echo "🔒 Creating ALB Security Group..."
ALB_SG=$(aws ec2 create-security-group \
  --group-name dairy-alb-sg \
  --description "Security group for Dairy App ALB" \
  --vpc-id ${VPC_ID} \
  --region ${AWS_REGION} \
  --query 'GroupId' \
  --output text 2>/dev/null || \
  aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=dairy-alb-sg" \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

echo "ALB Security Group: ${ALB_SG}"

# Add inbound rules for ALB
aws ec2 authorize-security-group-ingress \
  --group-id ${ALB_SG} \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --region ${AWS_REGION} 2>/dev/null || echo "HTTP rule exists"

aws ec2 authorize-security-group-ingress \
  --group-id ${ALB_SG} \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0 \
  --region ${AWS_REGION} 2>/dev/null || echo "HTTPS rule exists"

# Step 5: Create ECS Task Security Group
echo "🔒 Creating ECS Task Security Group..."
TASK_SG=$(aws ec2 create-security-group \
  --group-name dairy-task-sg \
  --description "Security group for Dairy App ECS Tasks" \
  --vpc-id ${VPC_ID} \
  --region ${AWS_REGION} \
  --query 'GroupId' \
  --output text 2>/dev/null || \
  aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=dairy-task-sg" \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

echo "Task Security Group: ${TASK_SG}"

# Allow traffic from ALB to ECS tasks
aws ec2 authorize-security-group-ingress \
  --group-id ${TASK_SG} \
  --protocol tcp \
  --port 3000 \
  --source-group ${ALB_SG} \
  --region ${AWS_REGION} 2>/dev/null || echo "Task inbound rule exists"

# Step 6: Update RDS Security Group to allow ECS tasks
echo "🔒 Updating RDS Security Group..."
RDS_SG="sg-03c0b2240a1f28e3a"

aws ec2 authorize-security-group-ingress \
  --group-id ${RDS_SG} \
  --protocol tcp \
  --port 5432 \
  --source-group ${TASK_SG} \
  --region ${AWS_REGION} 2>/dev/null || echo "RDS inbound rule exists"

# Step 7: Create ECS Task Execution Role
echo "👤 Creating ECS Task Execution Role..."
cat > /tmp/ecs-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
  --role-name ecsTaskExecutionRole-dairy \
  --assume-role-policy-document file:///tmp/ecs-trust-policy.json \
  --region ${AWS_REGION} 2>/dev/null || echo "Role may already exist"

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole-dairy \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
  --region ${AWS_REGION} 2>/dev/null || echo "Policy may already be attached"

# Step 8: Create Secrets in AWS Secrets Manager
echo "🔐 Creating Secrets in AWS Secrets Manager..."
aws secretsmanager create-secret \
  --name dairy-app/rds-credentials \
  --description "RDS credentials for Dairy App" \
  --secret-string "{\"username\":\"dairy_app\",\"password\":\"REPLACE_WITH_ACTUAL_PASSWORD\"}" \
  --region ${AWS_REGION} 2>/dev/null || echo "Secret may already exist"

echo ""
echo "✅ Infrastructure setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update the secret in AWS Secrets Manager with actual RDS password"
echo "2. Create database user 'dairy_app' in RDS"
echo "3. Create ECS Task Definition (see task-definition.json)"
echo "4. Create Application Load Balancer"
echo "5. Create ECS Service"
echo "6. Deploy your application with: ./deploy-aws-ecs.sh"
echo ""
echo "🔍 Important values:"
echo "   ALB Security Group: ${ALB_SG}"
echo "   Task Security Group: ${TASK_SG}"
echo "   VPC ID: ${VPC_ID}"
echo "   RDS Security Group: ${RDS_SG}"
