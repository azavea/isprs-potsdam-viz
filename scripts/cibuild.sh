#!/bin/bash

set -e

if [[ -n "${POTSDAM_DEBUG}" ]]; then
    set -x
fi

function usage() {
    echo -n \
         "Usage: $(basename "$0")
Build application for staging or a release.
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
        # Build React application, which assembles the bundle within
        # the container image.
        TRAVIS_COMMIT="${TRAVIS_COMMIT}" docker-compose run --rm --no-deps \
                  app-frontend run bundle

        # Build the Nginx container image and pull in the staging area
        # web root.
        TRAVIS_COMMIT="${TRAVIS_COMMIT}" docker-compose \
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
