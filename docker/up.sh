#!/bin/bash
set -euo pipefail

FILE_PATH="$(realpath $BASH_SOURCE)"
CURRENT_DIR="$(dirname $FILE_PATH)"


docker-compose -f "$CURRENT_DIR"/docker-compose.yml -p node-http up -d --build
