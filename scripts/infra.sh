#!/bin/bash

set -e

if [[ -n "${PC_DEMO_DEBUG}" ]]; then
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

    if [[ -n "${PC_SETTINGS_BUCKET}" ]]; then
        pushd "${TERRAFORM_DIR}"

        # Stop Terraform from trying to apply incorrect state across environments
        if [ -f ".terraform/terraform.tfstate" ] && ! grep -q "${PC_SETTINGS_BUCKET}" ".terraform/terraform.tfstate"; then
            echo "ERROR: Incorrect target environment detected in Terraform state! Please run"
            echo "       the following command before proceeding:"
            echo
            echo "  rm -rf terraform/.terraform"
            echo
           exit 1
        fi

        aws s3 cp "s3://${PC_SETTINGS_BUCKET}/terraform/terraform.tfvars" "${PC_SETTINGS_BUCKET}.tfvars"

        terraform remote config \
                  -backend="s3" \
                  -backend-config="region=us-east-1" \
                  -backend-config="bucket=${PC_SETTINGS_BUCKET}" \
                  -backend-config="key=terraform/state" \
                  -backend-config="encrypt=true"

        case "${1}" in
            fmt)
                terraform "$@"
                ;;
            taint)
                terraform "$@"
                ;;
            remote-push)
                terraform remote push
                ;;
            plan)
                terraform get -update
                terraform plan \
                          -var-file="${PC_SETTINGS_BUCKET}.tfvars" \
                          -var="git_commit=${GIT_COMMIT}" \
                          -out="${PC_SETTINGS_BUCKET}.tfplan"
                ;;
            destroy)
                terraform get -update
                terraform destroy -var-file="${PC_SETTINGS_BUCKET}.tfvars"
                terraform remote push
                ;;
            apply)
                terraform get -update
                terraform apply "${PC_SETTINGS_BUCKET}.tfplan"
                terraform remote push
                ;;
            *)
                echo "ERROR: I don't have support for that Terraform subcommand!"
                exit 1
                ;;
        esac

        popd
    else
        echo "ERROR: No PC_SETTINGS_BUCKET variable defined."
        exit 1
    fi
fi
