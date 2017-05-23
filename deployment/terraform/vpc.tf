# # VPC module for setting up vpc

module "vpc" {
  source                     = "github.com/azavea/terraform-aws-vpc?ref=3.1.1"
  name                       = "pc${var.environment}"
  region                     = "${var.aws_region}"
  key_name                   = "${var.aws_key_name}"
  cidr_block                 = "${var.vpc_cidr_block}"
  external_access_cidr_block = "${var.vpc_external_access_cidr_block}"
  private_subnet_cidr_blocks = "${var.vpc_private_subnet_cidr_blocks}"
  public_subnet_cidr_blocks  = "${var.vpc_public_subnet_cidr_blocks}"
  availability_zones         = "${var.aws_availability_zones}"
  bastion_ami                = "${var.vpc_bastion_ami}"
  bastion_instance_type      = "${var.vpc_bastion_instance_type}"

  project     = "${var.project}"
  environment = "${var.environment}"
}

resource "aws_security_group_rule" "bastion_ssh_ingress" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["${var.vpc_external_access_cidr_block}"]
  security_group_id = "${module.vpc.bastion_security_group_id}"
}

resource "aws_security_group_rule" "bastion_ssh_egress" {
  type              = "egress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["${module.vpc.cidr_block}"]
  security_group_id = "${module.vpc.bastion_security_group_id}"
}

resource "aws_security_group_rule" "bastion_http_egress" {
  type              = "egress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = "${module.vpc.bastion_security_group_id}"
}

resource "aws_security_group_rule" "bastion_https_egress" {
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = "${module.vpc.bastion_security_group_id}"
}
