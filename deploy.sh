#!/bin/bash

set -euo pipefail

if [ "$#" -gt 0 ]; then
  STACK_NAME=$1
else
  STACK_NAME="coffee-store-v2-${USER}"
fi

echo "Deploying stack $STACK_NAME"
echo

CDK_OUT_DIR="build/cdk.out"
mkdir -p $CDK_OUT_DIR

# Assumes CDK has been bootstrapped in the current account + region
npx cdk deploy --output $CDK_OUT_DIR --require-approval never --context stackName="$STACK_NAME"
