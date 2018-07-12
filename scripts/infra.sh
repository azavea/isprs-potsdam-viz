#!/bin/bash

set -e

if [[ -n "${POTSDAM_DEBUG}" ]]; then
    set -x
fi

DIR="$(dirname "$0")"

function usage() {
    echo -n \
"Usage: $(basename "$0") COMMAND OPTION[S]
Execute Terraform subcommands with remote state management.
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
        TERRAFORM_DIR="${DIR}/../deployment/terraform"
        echo
        echo "Attempting to deploy application version [${TRAVIS_COMMIT}]..."
        echo "-----------------------------------------------------"
        echo
    fi

    if [[ -n "${POTSDAM_SETTINGS_BUCKET}" ]]; then
        pushd "${TERRAFORM_DIR}"

        case "${1}" in
            plan)
                rm -rf .terraform terraform.tfstate* 
                aws s3 cp "s3://${POTSDAM_SETTINGS_BUCKET}/terraform/potsdam/terraform.tfvars" \
                    "${POTSDAM_SETTINGS_BUCKET}.tfvars"

                terraform init \
                  -backend-config="bucket=${POTSDAM_SETTINGS_BUCKET}" \
                  -backend-config="key=terraform/potsdam/state"

                terraform plan \
                          -var="image_version=\"${TRAVIS_COMMIT}\"" \
                          -var-file="${POTSDAM_SETTINGS_BUCKET}.tfvars" \
                          -out="${POTSDAM_SETTINGS_BUCKET}.tfplan"
                ;;
            apply)
                terraform apply "${POTSDAM_SETTINGS_BUCKET}.tfplan"
                ;;
            *)
                echo "ERROR: I don't have support for that Terraform subcommand!"
                exit 1
                ;;
        esac

        popd
    else
        echo "ERROR: No POTSDAM_SETTINGS_BUCKET variable defined."
        exit 1
    fi
fi
