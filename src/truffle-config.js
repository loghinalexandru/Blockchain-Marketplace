module.exports = {
  contracts_build_directory: "../client-app/src/assets/build",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 5000000,
      accounts: 20
    }
  },
  compilers: {
    solc: {
      version: "0.7.3",
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 200      // Default: 200
        },
      }
    }
  }
};
