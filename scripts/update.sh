#!/bin/bash

set -e

if [[ -n "${PC_DEMO_DEBUG}" ]]; then
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
        # Install npm dependencies
        docker-compose \
            -f docker-compose.yml \
            run --rm --no-deps app-frontend npm install

        # Build React application
        docker-compose \
            -f docker-compose.yml \
            -f docker-compose.test.yml \
            run --rm --no-deps app-frontend
    fi
fi
