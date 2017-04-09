#
# Security group resources
#
resource "aws_security_group" "server_app_alb" {
  #  vpc_id = "${module.vpc.id}"
  vpc_id = "${var.vpc_id}"

  tags {
    Name        = "sgAppServerLoadBalancer"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

#
# ALB resources
#
resource "aws_alb" "server_app" {
  security_groups = ["${aws_security_group.server_app_alb.id}"]
  #  subnets         = ["${module.vpc.public_subnet_ids}"]
  subnets = ["${var.vpc_subnet_ids}"]
  name            = "${var.project_id}-alb${var.environment}AppServer"

  tags {
    Name        = "albAppServer"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

resource "aws_alb_target_group" "server_app_http" {
  # Name can only be 32 characters long, so we MD5 hash the name and
  # truncate it to fit.
  name = "tf-tg-${replace("${md5("${var.project_id}-${var.environment}HTTPAppServer")}", "/(.{0,26})(.*)/", "$1")}"
  health_check {
    healthy_threshold   = "3"
    interval            = "60"
    matcher             = "301"
    protocol            = "HTTP"
    timeout             = "3"
    path                = "/"
    unhealthy_threshold = "2"
  }
  port     = "80"
  protocol = "HTTP"
  #  vpc_id   = "${module.vpc.id}"
  vpc_id = "${var.vpc_id}"
  tags {
    Name        = "tg${var.project_id}-${var.environment}HTTPAppServer"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

# resource "aws_alb_target_group" "server_app_https" {
#   # Name can only be 32 characters long, so we MD5 hash the name and
#   # truncate it to fit.
#   name = "tf-tg-${replace("${md5("${var.environment}HTTPSAppServer")}", "/(.{0,26})(.*)/", "$1")}"
#   health_check {
#     healthy_threshold   = "3"
#     interval            = "30"
#     protocol            = "HTTP"
#     timeout             = "3"
#     path                = "/healthcheck/"
#     unhealthy_threshold = "2"
#   }
#   port     = "443"
#   protocol = "HTTP"
#   vpc_id   = "${module.vpc.id}"
#   tags {
#     Name        = "tg${var.project_id}-${var.environment}HTTPSAppServer"
#     Project     = "${var.project}"
#     Environment = "${var.environment}"
#   }
# }

resource "aws_alb_listener" "server_app_http" {
  load_balancer_arn = "${aws_alb.server_app.id}"
  port              = "80"
  protocol          = "HTTP"
  default_action {
    target_group_arn = "${aws_alb_target_group.server_app_http.id}"
    type             = "forward"
  }
}

# resource "aws_alb_listener" "server_app_https" {
#   load_balancer_arn = "${aws_alb.server_app.id}"
#   port              = "443"
#   protocol          = "HTTPS"
#   certificate_arn   = "${var.ssl_certificate_arn}"
#   default_action {
#     target_group_arn = "${aws_alb_target_group.server_app_https.id}"
#     type             = "forward"
#   }
# }

data "template_file" "app_server_http_ecs_task" {
  template = "${file("task-definitions/app-server.json")}"
  vars {
    nginx_image_url      = "${var.nginx_image}"
    api_server_image_url = "${var.api_server_image}"
    region               = "${var.aws_region}"
    environment          = "${var.environment}"
  }
}

resource "aws_ecs_task_definition" "app_server" {
  family                = "${var.project_id}_${var.environment}AppServer"
  container_definitions = "${data.template_file.app_server_http_ecs_task.rendered}"
}

# Defines running an ECS task as a service
resource "aws_ecs_service" "server" {
  name                               = "${var.project_id}-${var.environment}Server"
  cluster                            = "${aws_ecs_cluster.container_instance.id}"
  task_definition                    = "${aws_ecs_task_definition.app_server.family}:${aws_ecs_task_definition.app_server.revision}"
  desired_count                      = "${var.desired_instance_count}"
  iam_role                           = "${aws_iam_role.container_instance_ecs.name}"
  deployment_minimum_healthy_percent = "0" # allow old services to be torn down
  deployment_maximum_percent         = "100"

  load_balancer {
    target_group_arn = "${aws_alb_target_group.server_app_http.id}"
    container_name   = "nginx"
    container_port   = "80"
  }
}
