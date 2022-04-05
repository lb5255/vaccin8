#!/bin/bash
#Randall Weber 1/25/22
#Script to  pull from git repository
#and launch docker containers

#Pulls git repository
function pull(){
git pull project main

}

#Runs Docker compose to build environment
function build(){

docker compose -f docker-compose-prod.yml up
}

pull;
build;
