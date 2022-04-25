#!/bin/bash

set -euo pipefail

npm install
npm run build
npm run unit-test
