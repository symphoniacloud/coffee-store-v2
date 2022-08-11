#!/bin/bash

set -euo pipefail

if [ "$#" -gt 0 ]; then
  STACK_NAME=$1
else
  STACK_NAME="coffee-store-v2-${USER}"
fi

echo "Deploying stack $STACK_NAME"
echo

# Assumes CDK has been bootstrapped in the current account + region
npm run deploy -- --context stackName="$STACK_NAME"
