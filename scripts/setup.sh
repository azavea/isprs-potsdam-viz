#!/bin/bash

set -e

if [[ -n "${PC_DEMO_DEBUG}" ]]; then
    set -x
fi

function usage() {
    echo -n \
         "Usage: $(basename "$0")
Attempts to setup the project's development environment.
"
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]
then
    if [ "${1:-}" = "--help" ]
    then
        usage
    else
        if ansible --version | grep -q "ansible 2.2."; then
            vagrant up --provision
            vagrant ssh -c "cd /vagrant && ./scripts/update.sh"
        else
            echo "ERROR: Version of Ansible installed locally should be in the 2.2.x series."
            exit 1
        fi
    fi
fi
