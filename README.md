# ISPRS Potsdam data viewer

This is an application for viewing the ISPRS Potsdamn dataset and results from Azavea's Raster Vision project.

### Requirements

* Vagrant 1.8+
* VirtualBox 4.3+
* Ansible 2.2+

### Getting Started

#### Quick setup

Make sure you have a `geotrellis` profile in your aws-cli profiles, with keys that can access
your data on S3.

Clone the project, `cd` into the directory, then run `./scripts/setup.sh` to create the Vagrant VM and then build the Docker container(s).

`setup.sh` can also be used to restore the project to its initial state: it will re-provision the VM, then remove and rebuild the Docker container(s).

Note: this will destroy the VM's existing Docker container before rebuilding it.

#### To run just the UI server

```
./scripts/setup.sh
vagrant up
vagrant ssh
./scripts/server.sh
```

#### Downloading test data

`make load-local` will download the necessary data.

#### Using Docker in the VM

The other project scripts are meant to execute in the VM in the `/vagrant` directory. To run the container during development use the following commands:

    vagrant up
    vagrant ssh
    ./scripts/server.sh

### Scripts

| Name | Description |
| --- | --- |
| `cibuild.sh` | Build the project for CI server __TODO__ |
| `clean.sh` | Clean up unused Docker resources to free disk space. __TODO__ |
| `console.sh` | Run `docker-compose exec app /bin/sh` __TODO__ |
| `lint.sh` | Run ESLint __TODO__ |
| `server.sh` | Run `docker-compose up` and start a server on port 8284 |
| `setup.sh` | Bring up the VM, and then destroy and rebuild the Docker container |
| `test.sh` | Run tests __TODO__ |
| `update.sh` | Update the app container with `npm` dependencies __TODO__ |

## Makefile

| Command          | Description
|------------------|------------------------------------------------------------|
|local-run         |Run benchmark job locally                                   |
|upload-code       |Upload code and scripts to S3                               |
|create-cluster    |Create EMR cluster with configurations                      |
|ingest-dsm        |IDW ingest with or without pyramiding                       |
|ingest-labels     |Raw PointCloud ingest without pyramiding yet                |
|ingest-rgbir      |Local IDW ingest with or without pyramiding                 |
|ingest-unet       |Run server on EMR master                                    |
|ingest-fcn        |TIN ingest with or without pyramiding                       |
|wait              |Wait for last step to finish                                |
|proxy             |Create SOCKS proxy for active cluster                       |
|ssh               |SSH into cluster master                                     |
|get-logs          |Get spark history logs from active cluster                  |
|clean             |Clean local project                                         |


## Running on EMR

_Requires_: Reasonably up to date [`aws-cli`](https://aws.amazon.com/cli/).

### Configuration

 - [config-aws.mk](./config-aws.mk) AWS credentials, S3 staging bucket, subnet, etc
 - [config-emr.mk](./config-emr.mk) EMR cluster type and size
 - [config-run.mk](./config-run.mk) Ingest step parameters

You will need to modify `config-aws.mk` to reflect your credentials and your VPC configuration. `config-emr.mk` and `config-ingest.mk` have been configured with an area over Japan. Be especially aware that as you change instance types `config-emr.mk` parameters like `EXECUTOR_MEMORY` and `EXECUTOR_CORES` need to be reviewed and likely adjusted.

### EMR pipeline example

```bash
make upload-code && make create-cluster
make ingest-rgbir
```

## Licence

* Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
