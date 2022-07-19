#!/bin/sh

source ./local_env.sh

./node_modules/.bin/knex migrate:latest
