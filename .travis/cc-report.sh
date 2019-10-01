#!/usr/bin/env bash

DIR=$(dirname $0)
ROOT=$(dirname $DIR)

if [ ! -f "$DIR/cc-test-reporter" ]; then
  echo "No test reporter found";
  exit 1;
fi

function format_lcov () {
  for f in $@; do
    if [ -f $f ]; then
      FILENAME=$(echo "$f" | cut -c3- | sed s_\/_-_g | sed s/.info/.json/)

      echo "Formatting $f into coverage/coverage-${FILENAME}";
      $DIR/cc-test-reporter format-coverage -t lcov -o $ROOT/coverage/fmt-coverage-${FILENAME} $f;

      echo "Contents:"
      echo $(cat $ROOT/coverage/fmt-coverage-${FILENAME} | head -n 100)
    fi
  done
}

files=$(find "$ROOT" -name 'lcov.info' -type f -not -path "*/node_modules/*")
echo "Found coverage info in:"
echo "$files"

format_lcov ${files[@]}
