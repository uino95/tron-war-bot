#!/usr/bin/env bash

echo "Running provisioning script..."

#Add Ethereum repository
echo "Adding Tron repository..."
# add-apt-repository -y ppa:ethereum/ethereum
add-apt-repository -y ppa:openjdk-r/ppa

echo "Updating VM..."
apt-get update
apt-get upgrade -y
echo "Installing Python 2.7..."
apt-get install python -y
apt-get install python-pip -y
echo "Installing build tools..."
apt-get install build-essential -y
echo "Installing openjdk-8..."
apt-get install openjdk-8-jdk -y
apt-get install openjfx -y


# apt-get install ethereum -y


# echo "Installing nginx..."
# apt-get install nginx

echo "End of privileged user execution"
