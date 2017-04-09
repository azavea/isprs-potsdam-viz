#
# ECS IAM resources
#
data "aws_iam_policy_document" "container_instance_ecs_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "container_instance_ecs" {
  name               = "${var.project_id}-ecs${var.environment}InstanceRole"
  assume_role_policy = "${data.aws_iam_policy_document.container_instance_ecs_assume_role.json}"
}

resource "aws_iam_role_policy_attachment" "ecs_for_ec2_policy_app_server_ecs_role" {
  role       = "${aws_iam_role.container_instance_ecs.name}"
  policy_arn = "${var.aws_ecs_for_ec2_service_role_policy_arn}"
}

resource "aws_iam_role_policy_attachment" "ecs_policy" {
  role       = "${aws_iam_role.container_instance_ecs.name}"
  policy_arn = "${var.aws_ecs_service_role_policy_arn}"
}

#
# EC2 IAM resources
#
data "aws_iam_policy_document" "container_instance_ec2_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "container_instance_ec2" {
  name               = "${var.project_id}-${var.environment}ContainerInstanceProfile"
  assume_role_policy = "${data.aws_iam_policy_document.container_instance_ec2_assume_role.json}"
}

resource "aws_iam_role_policy_attachment" "ecs_for_ec2_policy_container_instance_role" {
  role       = "${aws_iam_role.container_instance_ec2.name}"
  policy_arn = "${var.aws_ecs_for_ec2_service_role_policy_arn}"
}

resource "aws_iam_role_policy_attachment" "s3_policy_container_instance_role" {
  role       = "${aws_iam_role.container_instance_ec2.name}"
  policy_arn = "${var.aws_s3_policy_arn}"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_logs_policy_container_instance_role" {
  role       = "${aws_iam_role.container_instance_ec2.name}"
  policy_arn = "${var.aws_cloudwatch_logs_policy_arn}"
}

resource "aws_iam_instance_profile" "container_instance" {
  name  = "${aws_iam_role.container_instance_ec2.name}"
  roles = ["${aws_iam_role.container_instance_ec2.name}"]
}
