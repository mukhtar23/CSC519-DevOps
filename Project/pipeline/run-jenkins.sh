#!/bin/bash

# Exit on error
set -e

# Trace commands as we run them:
set +x

# Print error message and exit with error code 1
function die {
    echo "$1"
    exit 1
}

# Check the number of arguments
[ $# -ge 4 ] || die "usage: $0 <playbook> <inventory> <user> <pass>"

PLAYBOOK=$1
INVENTORY=$2
# USER=$3
# PASS=$4

ansible-playbook $PLAYBOOK -i $INVENTORY -e "githubuser=$3" -e "githubpassword=$4" --vault-password-file /tmp/vault_pass.txt