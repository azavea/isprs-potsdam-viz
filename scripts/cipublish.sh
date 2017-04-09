#!/bin/bash

set -e

if [[ -n "${PC_DEMO_DEBUG}" ]]; then
    set -x
fi

DIR="$(dirname "$0")"

function usage() {
    echo -n \
"Usage: $(basename "$0")

Publish container images to Elastic Container Registry (ECR) and
other artifacts to S3.
"
}

if [[ -n "${GIT_COMMIT}" ]]; then
    GIT_COMMIT="${GIT_COMMIT:0:7}"
else
    GIT_COMMIT="$(git rev-parse --short HEAD)"
fi

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    if [ "${1:-}" = "--help" ]; then
        usage
    else
        if [[ -n "${AWS_ECR_ENDPOINT}" ]]; then
            # echo "Building application JAR"
            # docker-compose \
            #     run --rm --no-deps api-server server/clean
            # docker-compose \
            #     run --rm --no-deps api-server server/assembly

            # Build React application, which assembles the bundle within
            # the container image.
            GIT_COMMIT="${GIT_COMMIT}" docker-compose \
                      -f docker-compose.yml \
                      -f docker-compose.test.yml \
                      run --rm --no-deps app-frontend

            echo "Building container images"
            GIT_COMMIT="${GIT_COMMIT}" docker-compose \
                      -f "${DIR}/../docker-compose.yml" \
                      -f "${DIR}/../docker-compose.test.yml"\
                      build nginx api-server

            # # Evaluate the return value of the get-login subcommand, which
            # # is a docker login command with temporarily ECR credentials.
            eval "$(aws ecr get-login --region us-east-1)"

            docker tag "pointcloud-nginx:${GIT_COMMIT}" \
                   "${AWS_ECR_ENDPOINT}/pointcloud-nginx:${GIT_COMMIT}"
            docker tag "pointcloud-api-server:${GIT_COMMIT}" \
                   "${AWS_ECR_ENDPOINT}/pointcloud-api-server:${GIT_COMMIT}"

            docker push "${AWS_ECR_ENDPOINT}/pointcloud-nginx:${GIT_COMMIT}"
            docker push "${AWS_ECR_ENDPOINT}/pointcloud-api-server:${GIT_COMMIT}"

        else
            echo "ERROR: No AWS_ECR_ENDPOINT variable defined."
            exit 1
        fi
    fi
fi
