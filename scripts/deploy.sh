#!/bin/bash


set -e

if [[ -n "${POTSDAM_DEBUG}" ]]; then
    set -x
fi


if [[ -n "${TRAVIS_COMMIT}" ]]; then
    TRAVIS_COMMIT="${TRAVIS_COMMIT:0:7}"
else
    TRAVIS_COMMIT=$(git rev-parse --short HEAD)
fi

DIR="$(dirname "$0")"

function usage() {
    echo -n \
"Usage: $(basename "$0") COMMAND OPTION[S]
Deploy AWS infrastructure using Terraform.
This script is only for use with Travis CI.
"
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    if [ "${1:-}" = "--help" ]; then
        usage
        exit 0
    fi
    pushd "${DIR}/../"
    ./scripts/cipublish.sh
    docker-compose -f docker-compose.ci.yml run --rm terraform ./scripts/infra.sh plan
    docker-compose -f docker-compose.ci.yml run --rm terraform ./scripts/infra.sh apply
    popd
fi