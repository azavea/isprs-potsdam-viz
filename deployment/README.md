# Amazon Web Services Deployment

Amazon Web Services deployment is driven by [Terraform](https://terraform.io/) and the [AWS Command Line Interface (CLI)](http://aws.amazon.com/cli/).

## Table of Contents

* [AWS Credentials](#aws-credentials)
* [Terraform](#terraform)

## AWS Credentials

Using the AWS CLI, create an AWS profile named `pc-demo`:

```bash
$ vagrant ssh
vagrant@vagrant-ubuntu-trusty-64:~$ aws --profile pc-demo configure
AWS Access Key ID [********************]:
AWS Secret Access Key [********************]:
Default region name [us-east-1]: us-east-1
Default output format [None]:
```

You will be prompted to enter your AWS credentials, along with a default region. These credentials will be used to authenticate calls to the AWS API when using Terraform and the AWS CLI.

## Terraform

Next, use the `infra` wrapper script to lookup the remote state of the infrastructure and assemble a plan for work to be done:

```bash
vagrant@vagrant-ubuntu-trusty-64:~$ export PGW_COMMUNITY_MAPPING_SETTINGS_BUCKET="staging-pgw-cm-config-us-east-1"
vagrant@vagrant-ubuntu-trusty-64:~$ export PGW_COMMUNITY_MAPPING_SITE_BUCKET="staging-pgw-cm-site-us-east-1"
vagrant@vagrant-ubuntu-trusty-64:~$ export AWS_PROFILE="pgw-cm-stg"
vagrant@vagrant-ubuntu-trusty-64:~$ ./scripts/infra.sh plan
```

Once the plan has been assembled, and you agree with the changes, apply it:

```bash
vagrant@vagrant-ubuntu-trusty-64:~$ ./scripts/infra.sh apply
```

This will attempt to apply the plan assembled in the previous step using Amazon's APIs. In order to change specific attributes of the infrastructure, inspect the contents of the environment's configuration file in Amazon S3.
