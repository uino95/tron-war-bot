module.exports = {
  compilers: {
    solc: {
      version: "^0.4.25", // A version or constraint - Ex. "^0.5.0"
      settings: {
        optimizer: {
          enabled: true,
          runs: 500   // Optimize for how many times you intend to run the code
        }
      }
    }
  },
  migrations_directory: "./migrations",
  networks: { },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500
    }
  }
};
