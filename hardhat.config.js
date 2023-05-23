/**
* @type import('hardhat/config').HardhatUserConfig
*/
require("@nomicfoundation/hardhat-chai-matchers");
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
   solidity: "0.8.18",
   networks: {
      hardhat: {
        forking: {
          url: API_URL,
          blockNumber: 17228670
        },
      },
   },

}
