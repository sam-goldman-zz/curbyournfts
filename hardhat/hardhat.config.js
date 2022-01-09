require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-truffle5");

module.exports = {
  solidity: "0.8.0",
  defaultNetwork: "ropsten",
  networks: {
    hardhat: {
      accounts: {
        count: 600
      },
    },
    ropsten: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};