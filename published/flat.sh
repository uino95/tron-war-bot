if [ ! -d ./contracts ]; then
  echo "ERROR: Make sure to launch from root folder! Exiting..."
  exit
fi

if [ ! -d ./dist ]; then
  # Control will enter here if directory doesn't exists.
  echo "Creating dist directory..."
  mkdir ./dist
fi

truffle-flattener ./contracts/WarCoin.sol > ./dist/WarCoin.sol
truffle-flattener ./contracts/TronWarBot.sol > ./dist/TronWarBot.sol
