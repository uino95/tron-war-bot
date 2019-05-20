#!/usr/bin/env bash
cd $HOME
if [ -f running_nodes.json ]; then
  rm running_nodes.json
fi
echo "Launching tron-cli in background..."
tron-cli quick --reset True

cd /vagrant

# Migrate folders to home folder to avoid simlink errors
declare -a folders=("node_modules")

## now loop through the above array
for i in "${folders[@]}"
do
  if [ ! -d /home/vagrant/$i ]; then
    # Control will enter here if directory doesn't exists.
    echo "WARNING: /home/vagrant/$i not found. Creating directory..."
    mkdir /home/vagrant/$i
  fi
  if [ ! -d /vagrant/$i ]; then
    # Control will enter here if directory doesn't exists.
    echo "WARNING: /vagrant/$i not found. Creating directory..."
    mkdir /vagrant/$i
  fi
  echo "$i. Mounting $i virtual directory..."
  sudo mount --bind /home/vagrant/$i /vagrant/$i/
done

echo "Mounting symlink of contract folder for client application..."
if [ ! -d /vagrant/build ]; then
  # Control will enter here if directory doesn't exists.
  echo "WARNING: /vagrant/build not found. Creating directory..."
  mkdir /vagrant/build
fi

if [ ! -d /vagrant/build/contracts ]; then
  # Control will enter here if directory doesn't exists.
  echo "WARNING: /vagrant/build/contracts not found. Creating directory..."
  mkdir /vagrant/build/contracts
fi
# sudo mount --bind /vagrant/build/contracts /vagrant/src/contracts
# Prepare node_modules directory
# if [ ! -d /vagrant/node_modules ]; then
#   # Control will enter here if $DIRECTORY doesn't exists.
#   echo "WARNING: node_modules not found. Creating directory..."
#   mkdir /vagrant/node_modules
# fi
# if [ ! -d /home/vagrant/node_modules ]; then
#   # Control will enter here if $DIRECTORY doesn't exists.
#   echo "WARNING: node_modules not found. You might need to run npm i"
#   mkdir /home/vagrant/node_modules
# fi


tronbox migrate

echo "Server started. Log in under /vagrant directory and run"
