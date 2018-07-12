data "template_file" "ecs_potsdam_task" {
  template = "${file("task-definitions/app-server.json")}"

  vars {
    nginx_image_url      = "${var.aws_account_id}.dkr.ecr.us-east-1.amazonaws.com/potsdam-nginx:${var.image_version}"
    api_server_image_url = "${var.aws_account_id}.dkr.ecr.us-east-1.amazonaws.com/potsdam-api-server:${var.image_version}"
    region               = "${var.aws_region}"
    environment          = "${var.environment}"
  }
}

resource "aws_ecs_task_definition" "potsdam" {
  family                = "${var.environment}PotsdamDemo"
  container_definitions = "${data.template_file.ecs_potsdam_task.rendered}"
}

resource "aws_cloudwatch_log_group" "potsdam" {
  name = "log${var.environment}PotsdamDemo"

  tags {
    Environment = "${var.environment}"
  }
}

data "aws_iam_role" "autoscaling" {
  role_name = "${var.ecs_autoscaling_role_name}"
}

module "potsdam_ecs_service" {
  source = "github.com/azavea/terraform-aws-ecs-web-service?ref=0.2.0"

  name                = "Potsdam"
  vpc_id              = "${data.terraform_remote_state.core.vpc_id}"
  public_subnet_ids   = ["${data.terraform_remote_state.core.public_subnet_ids}"]
  access_log_bucket   = "${data.terraform_remote_state.core.logs_bucket_id}"
  access_log_prefix   = "ALB/Potsdam"
  port                = "443"
  ssl_certificate_arn = "${var.ssl_certificate_arn}"

  cluster_name                   = "${data.terraform_remote_state.core.container_instance_name}"
  task_definition_id             = "${aws_ecs_task_definition.potsdam.family}:${aws_ecs_task_definition.potsdam.revision}"
  desired_count                  = "${var.potsdam_ecs_desired_count}"
  min_count                      = "${var.potsdam_ecs_min_count}"
  max_count                      = "${var.potsdam_ecs_max_count}"
  deployment_min_healthy_percent = "${var.potsdam_ecs_deployment_min_percent}"
  deployment_max_percent         = "${var.potsdam_ecs_deployment_max_percent}"
  container_name                 = "nginx"
  container_port                 = "443"
  health_check_path              = "/"
  ecs_service_role_name          = "${data.terraform_remote_state.core.ecs_service_role_name}"
  ecs_autoscale_role_arn         = "${data.aws_iam_role.autoscaling.arn}"

  project     = "Potsdam Demo"
  environment = "${var.environment}"
}
