#
# EC2 IAM resources
#
resource "aws_iam_role_policy_attachment" "s3_policy_container_instance_role" {
  role       = "${data.terraform_remote_state.core.container_instance_ecs_for_ec2_service_role_name}"
  policy_arn = "${var.aws_s3_policy_arn}"
}
