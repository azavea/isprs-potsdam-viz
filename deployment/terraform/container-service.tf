#
# ECS Resources
#

# ECS cluster is only a name that ECS machines may join
resource "aws_ecs_cluster" "container_instance" {

  lifecycle {
    create_before_destroy = true
  }

  name = "${var.project_id}-ecs${var.environment}Cluster"
}

resource "aws_security_group" "container_instance" {
  #vpc_id = "${module.vpc.id}"
  vpc_id = "${var.vpc_id}"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  tags {
    Name        = "sgContainerInstance"
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}

data "template_file" "container_instance_cloud_config" {
  template = "${file("cloud-config/ecs-user-data.yml")}"

  vars {
    ecs_cluster_name = "${aws_ecs_cluster.container_instance.name}"
    environment      = "${var.environment}"
  }
}

#
# AutoScaling resources
#

# Defines a launch configuration for ECS worker, associates it with our cluster
resource "aws_launch_configuration" "ecs" {
  lifecycle {
    create_before_destroy = true
  }

  name = "ECS ${aws_ecs_cluster.container_instance.name}"
  image_id             = "${var.aws_ecs_ami}"
  instance_type        = "${var.ecs_instance_type}"
  key_name             = "${var.aws_key_name}"
  iam_instance_profile = "${aws_iam_instance_profile.container_instance.name}"
  security_groups      = ["${aws_security_group.container_instance.id}"]
  associate_public_ip_address = true

  #user_data = "${data.template_file.container_instance_cloud_config.rendered}"
  user_data = "#!/bin/bash\necho ECS_CLUSTER='${aws_ecs_cluster.container_instance.name}' > /etc/ecs/ecs.config"
}

# Auto-scaling group for ECS workers
resource "aws_autoscaling_group" "ecs" {
  lifecycle {
    create_before_destroy = true
  }

  # Explicitly linking ASG and launch configuration by name
  # to force replacement on launch configuration changes.
  name = "${aws_launch_configuration.ecs.name}"

  launch_configuration      = "${aws_launch_configuration.ecs.name}"
  health_check_grace_period = 600
  health_check_type         = "EC2"
  desired_capacity          = "${var.desired_instance_count}"
  min_size                  = "${var.desired_instance_count}"
  max_size                  = "${var.desired_instance_count}"
  #  vpc_zone_identifier       = ["${module.vpc.private_subnet_ids}"]
  vpc_zone_identifier       = ["${var.vpc_subnet_ids}"]

  tag {
    key                 = "Name"
    value               = "${var.project_id}-ContainerInstance"
    propagate_at_launch = true
  }

  tag {
    key                 = "Project"
    value               = "${var.project}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = "${var.environment}"
    propagate_at_launch = true
  }
}
