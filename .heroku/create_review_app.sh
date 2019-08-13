#!/usr/bin/env bash

# Create a heroku app from command line
#
# Usage:
#  $ bash create_app.sh <PR> -avd
#
# Example:
#  $ bash create_app.sh 242 -vd
#
# Arguments:
#  PR - Number of the PR that this set of apps should be created for (e.g. 132)
#
# Flags
#  a - Setup a new review version of the API
#  v - Setup a new review version of the visitor app
#  d - Setup a new review version of the dashboard app


function terminate () {
  if [ ! -z $1 ]; then
    echo $1
  fi
  exit 1
}

function _create_app () {
  local APP_NAME=$1
  local TEMPLATE_APP_NAME=$2
  local PIPELINE_NAME=$3
  local API_APP=$4

  heroku apps:create $APP_NAME --region eu --buildpack https://github.com/TwinePlatform/heroku-buildpack-select-subdir

  bash $(dirname $0)/config.sh get $TEMPLATE_APP_NAME _temp_cfg_dump.txt
  bash $(dirname $0)/config.sh put $APP_NAME _temp_cfg_dump.txt
  rm _temp_cfg_dump.txt

  heroku pipelines:add $PIPELINE_NAME -a $APP_NAME -s staging

  if [ ! -z $API_APP ]; then
    heroku config:set PROXY_API_URL="https://$API_APP.herokuapp.com" -a $APP_NAME
  fi
}


# Main

PR=$1

if [ -z $PR ]; then
  terminate "Must provide a name for the app"
fi

if [ -z $(which heroku) ]; then
  terminate "Must have heroku CLI installed"
fi

if [ $(heroku auth:whoami) != "powertochangetwine@gmail.com" ]; then
  terminate "Must be logged in as pipeline owner"
fi

while getopts avd opt; do
  case $opt in
    a) CREATE_API="true";;
    v) CREATE_VISITOR="true";;
    d) CREATE_DASHBOARD="true";;
    *) terminate "Unrecognised option $opt: only a, v, d supported"
  esac
done

if [ CREATE_API == "true" ]; then
  _create_app "twine-api-pr-$PR" "twine-api-staging" "twine-api-pipeline"
fi

if [ CREATE_VISITOR == "true" ]; then
  _create_app "twine-visitor-pr-$PR" "twine-visitor-staging" "twine-visitor-pipeline" "twine-api-pr-$PR"
fi

if [ CREATE_DASHBOARD == "true" ]; then
  _create_app "twine-dashboard-pr-$PR" "twine-dashboard-staging" "twine-volunteer-dashboard" "twine-api-pr-$PR"
fi