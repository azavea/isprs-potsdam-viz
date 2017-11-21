#
# S3 resources
#

resource "aws_s3_bucket" "catalogs" {
  bucket = "potsdam-${lower(var.environment)}-catalogs-${var.aws_region}"

  tags {
    Project     = "${var.project}"
    Environment = "${var.environment}"
  }
}
