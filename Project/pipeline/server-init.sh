#!/bin/bash

# Exit on error
set -e

# Trace commands as we run them:
set -x

# Script used to initialize your ansible server after provisioning.
sudo add-apt-repository ppa:ansible/ansible -y
sudo apt-get update
sudo apt-get install ansible -y

# Ensure security key has proper permissions
chmod 700 ~/.ssh/jenkins_rsa

# # for windows, makes scripts executable
# dos2unix /bakerx/pipeline/server-init.sh
# dos2unix /bakerx/pipeline/run-jenkins.sh

# create ansible vault password text file
echo ansiblevaultpassword > /tmp/vault_pass.txt

# set VM timezone to match testing timezone
sudo timedatectl set-timezone America/New_York