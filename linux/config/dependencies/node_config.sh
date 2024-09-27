#!/bin/bash

sudo apt-get update
sudo apt-get upgrade -y

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

node_version=$(node -v)
npm_version=$(npm -v)

echo -e "Version node: $1 $node_version\n"
echo -e "Version npm: $1 $npm_version"
