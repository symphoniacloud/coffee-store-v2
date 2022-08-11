#!/bin/bash

set -euo pipefail

npm install

# Just performs type checking - doesn't actually package - that is performed at deploy-time by CDK
npm run build

npm run unit-test
