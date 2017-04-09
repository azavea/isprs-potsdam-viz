#!/bin/bash
set -e

if [[ -n "${RF_DEBUG}" ]]; then
    set -x
fi

GIT_COMMIT="${GIT_COMMIT:-latest}"
DIR="$(dirname "$0")"

function usage() {
    echo -n \
"Usage: $(basename "$0")
Run various test suites.
"
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]
then
    if [ "${1:-}" = "--help" ]
    then
        usage
    else
        echo "Updating Scala dependencies"
        docker-compose \
            run --rm --no-deps api-server update

        echo "Executing Scala test suite"
        docker-compose \
            run --rm api-server test

    fi
    exit
fi
