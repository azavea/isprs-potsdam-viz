#!/bin/bash

set -e

if [[ -n "${PC_DEMO_DEBUG}" ]]; then
    set -x
fi

function usage() {
    echo -n \
         "Usage: $(basename "$0")
Build application for staging or a release.
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
        # Delete output from previous build.
        GIT_COMMIT="${GIT_COMMIT}" docker-compose \
                  -f docker-compose.yml \
                  -f docker-compose.test.yml \
                  run --entrypoint bash --rm --no-deps app-frontend \
                  -c 'rm -rf /usr/src/dist/*'

        # Build React application, which assembles the bundle within
        # the container image.
        GIT_COMMIT="${GIT_COMMIT}" docker-compose \
                  -f docker-compose.yml \
                  -f docker-compose.test.yml \
                  run --rm --no-deps app-frontend

        # Build the Nginx container image and pull in the staging area
        # web root.
        GIT_COMMIT="${GIT_COMMIT}" docker-compose \
                  -f docker-compose.yml \
                  -f docker-compose.test.yml \
                  build nginx

        ./scripts/test.sh

        # If the cibuild.d directory exists, source each script it
        # contains. This allows the core cibuild.sh to be extended with
        # project specific scripts.
        if [ -d "./scripts/cibuild.d" ]; then
            for file in ./scripts/cibuild.d/*.sh; do
                source "${file}"
            done
        fi
    fi
fi
