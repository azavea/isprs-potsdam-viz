#!/bin/bash

set -e

if [[ -n "${POTSDAM_DEBUG}" ]]; then
    set -x
fi

function usage() {
    echo -n \
         "Usage: $(basename "$0")

Builds and pulls container images using docker-compose.
"
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]
then
    if [ "${1:-}" = "--help" ]
    then
        usage
    else
        docker-compose pull

        docker-compose run --rm --no-deps \
            api-server update

        # Install npm dependencies
        docker-compose \
            -f docker-compose.yml \
            run --rm --no-deps app-frontend install --quiet

        # Build React application
        docker-compose \
            -f docker-compose.yml \
            -f docker-compose.test.yml \
            run --rm --no-deps app-frontend run bundle
    fi
fi
