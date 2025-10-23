require("@nomicfoundation/hardhat-toolbox");
require("@fhevm/hardhat-plugin");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true  // 关键：解决堆栈过深问题
    }
  },
  networks: {
    sepolia: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://1rpc.io/sepolia",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "J8PU7AX1JX3RGEH1SNGZS4628BAH192Y3N"
  },
  fhevm: {
    // FHE configuration
    network: "sepolia"
  }
};
