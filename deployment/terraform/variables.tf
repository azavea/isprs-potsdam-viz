variable "project" {
  default = "PointCloud Demo"
}

variable "project_id" {
  default = "PCDEMO"
}

variable "environment" {}

# AWS

variable "aws_region" {
  default = "us-east-1"
}

variable "aws_availability_zones" {
  default = ["us-east-1c", "us-east-1d"]
}

variable "aws_key_name" {}

# ECS

variable "api_server_image" {}
variable "nginx_image" {}

variable "desired_instance_count" {}
variable aws_ecs_ami {}
variable ecs_instance_type {}


# IAM

variable "aws_ecs_for_ec2_service_role_policy_arn" {
  default = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

variable "aws_ecs_service_role_policy_arn" {
  default = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceRole"
}

variable "aws_s3_policy_arn" {
  default = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

variable "aws_cloudwatch_logs_policy_arn" {
  default = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}


# VPC

# variable vpc_cidr_block {}
# variable vpc_external_access_cidr_block {}
# variable "vpc_private_subnet_cidr_blocks" {
#   default = ["10.0.1.0/24", "10.0.3.0/24"]
# }

# variable "vpc_public_subnet_cidr_blocks" {
#   default = ["10.0.0.0/24", "10.0.2.0/24"]
# }

# variable vpc_bastion_ami {}
# variable vpc_bastion_instance_type {}

variable vpc_id {}
variable vpc_subnet_ids {
  default = []
}
