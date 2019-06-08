const port = process.env.HOST_PORT || 9090

module.exports = {
  networks: {
    development: {
      // For trontools/quickstart docker image
      privateKey: 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0',
      consume_user_resource_percent: 100,
      feeLimit: 1e9,  // Set fee limit
      originEnergyLimit: 1e7,
      fullHost: 'http://127.0.0.1:' + port,
      network_id: "9"
    },
    shasta: {
      from: 'TB9EcbhwMzUq1nMcyAkdC3x5rSHB32S35i',
      privateKey: process.env.PRIVATE_KEY_SHASTA,
      consume_user_resource_percent: 100,
      feeLimit: 1e9,  // Set fee limit
      originEnergyLimit: 1e7,
      fullHost: "https://api.shasta.trongrid.io",
      network_id: "2"
    },
    mainnet: {
      // Don't put your private key here:
      privateKey: process.env.PRIVATE_KEY_MAINNET,
      /*
        Create a .env file (it must be gitignored) containing something like
          export PRIVATE_KEY_MAINNET=4E7FECCB71207B867C495B51A9758B104B1D4422088A87F4978BE64636656243
        Then, run the migration with:
          source .env && tronbox migrate --network mainnet
        */
      consume_user_resource_percent: 100,
      feeLimit: 1e9,  // Set fee limit
      originEnergyLimit: 1e7,
      fullHost: "https://api.trongrid.io",
      network_id: "1"
    }
  }
}
