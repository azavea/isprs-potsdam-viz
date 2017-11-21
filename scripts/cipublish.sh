#!/bin/bash

set -e

if [[ -n "${POTSDAM_DEBUG}" ]]; then
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

if [[ -n "${TRAVIS_COMMIT}" ]]; then
    TRAVIS_COMMIT="${TRAVIS_COMMIT:0:7}"
else
    TRAVIS_COMMIT="$(git rev-parse --short HEAD)"
fi

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    if [ "${1:-}" = "--help" ]; then
        usage
    else
        if [[ -n "${AWS_ECR_ENDPOINT}" ]]; then
            echo "Building application JAR"
            docker-compose \
                run --rm --no-deps api-server server/clean
            docker-compose \
                run --rm --no-deps api-server server/assembly

            echo "Building api-server container image"
            TRAVIS_COMMIT="${TRAVIS_COMMIT}" docker-compose \
                      -f "${DIR}/../docker-compose.yml" \
                      -f "${DIR}/../docker-compose.test.yml"\
                      build api-server

            # Evaluate the return value of the get-login subcommand, which
            # is a docker login command with temporarily ECR credentials.
            eval "$(aws ecr get-login --region us-east-1 --no-include-email)"

            docker tag "potsdam-nginx:${TRAVIS_COMMIT}" \
                   "${AWS_ECR_ENDPOINT}/potsdam-nginx:${TRAVIS_COMMIT}"
            docker tag "potsdam-api-server:${TRAVIS_COMMIT}" \
                   "${AWS_ECR_ENDPOINT}/potsdam-api-server:${TRAVIS_COMMIT}"

            docker push "${AWS_ECR_ENDPOINT}/potsdam-nginx:${TRAVIS_COMMIT}"
            docker push "${AWS_ECR_ENDPOINT}/potsdam-api-server:${TRAVIS_COMMIT}"

        else
            echo "ERROR: No AWS_ECR_ENDPOINT variable defined."
            exit 1
        fi
    fi
fi
