#!/bin/bash
set -euo pipefail

echo "Deleting build folder"
rm -rf build

echo "Building TypeScript"
tsc
echo "TypeScript successfully built"

echo "Converting .js files to .mjs"

FILES=$(find "./build" -name "*.js")

for path in $FILES
do

    echo "Editing $path"

    sed -r -i "s/(import ?[^\"]+\"([^\"]+))\.js/\1.mjs/" "$path"

    mv "$path" "${path/%.js/.mjs}"

done

echo "Done converting files to .mjs"

cp -r src/resources build/resources

echo "Copying Resources directory"
