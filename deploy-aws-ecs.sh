#!/bin/bash

# AWS ECS Deployment Script for Dairy Management System
# This script deploys the application to AWS ECS with Fargate

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="612069931695"
ECR_REPOSITORY="dairy-app"
ECS_CLUSTER="dairy-cluster"
ECS_SERVICE="dairy-service"
TASK_FAMILY="dairy-task"
IMAGE_TAG="latest"

echo "🚀 Starting deployment to AWS ECS..."

# Step 1: Build Docker image
echo "📦 Building Docker image..."
docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} .

# Step 2: Authenticate to ECR
echo "🔐 Authenticating to AWS ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Step 3: Create ECR repository if it doesn't exist
echo "📚 Ensuring ECR repository exists..."
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} 2>/dev/null || \
  aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${AWS_REGION}

# Step 4: Tag image
echo "🏷️  Tagging image..."
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}

# Step 5: Push image to ECR
echo "⬆️  Pushing image to ECR..."
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}

# Step 6: Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service \
  --cluster ${ECS_CLUSTER} \
  --service ${ECS_SERVICE} \
  --force-new-deployment \
  --region ${AWS_REGION}

echo "✅ Deployment complete!"
echo "📊 Monitor deployment:"
echo "   aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}"
