#!/bin/bash

set -e

if [[ -n "${RV_DEBUG}" ]]; then
    set -x
fi

DIR="$(dirname "$0")"

function usage() {
    echo -n \
"Usage: $(basename "$0") COMMAND OPTION[S]
Execute Terraform subcommands with remote state management.
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
        TERRAFORM_DIR="${DIR}/../deployment/terraform"
        echo
        echo "Attempting to deploy application version [${GIT_COMMIT}]..."
        echo "-----------------------------------------------------"
        echo
    fi

    if [[ -n "${RV_SETTINGS_BUCKET}" ]]; then
        pushd "${TERRAFORM_DIR}"

        aws s3 cp "s3://${RV_SETTINGS_BUCKET}/terraform/terraform.tfvars" "${RV_SETTINGS_BUCKET}.tfvars"

        case "${1}" in
            plan)
                rm -rf .terraform terraform.tfstate* 
                terraform init \
                  -backend-config="bucket=${RV_SETTINGS_BUCKET}" \
                  -backend-config="key=terraform/state"

                terraform plan \
                          -var-file="${RV_SETTINGS_BUCKET}.tfvars" \
                          -var="image_version=${GIT_COMMIT}" \
                          -out="${RV_SETTINGS_BUCKET}.tfplan"
                ;;
            apply)
                terraform apply "${RV_SETTINGS_BUCKET}.tfplan"
                ;;
            *)
                echo "ERROR: I don't have support for that Terraform subcommand!"
                exit 1
                ;;
        esac

        popd
    else
        echo "ERROR: No RV_SETTINGS_BUCKET variable defined."
        exit 1
    fi
fi
