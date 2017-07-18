#
# Route 53 Resources
#
resource "aws_route53_zone" "external" {
  name = "${var.route53_external_hosted_zone}"
}

resource "aws_route53_record" "server_app" {
  zone_id = "${aws_route53_zone.external.id}"
  name    = "${var.route53_external_hosted_zone}"
  type    = "A"

  alias {
    name                   = "${lower(aws_alb.server_app.dns_name)}."
    zone_id                = "${aws_alb.server_app.zone_id}"
    evaluate_target_health = true
  }
}
