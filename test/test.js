const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe('Simulation', function () {
  let cUSDC_Contract, cUSDC_ABI, USDC_Contract, USDC_ABI, WETH_Contract, WETH_ABI,
    USDCholderAddress, AliceSign, AlicecUSDCv3, AliceUSDC, WETHholderAddress, BobSign, BobcUSDCv3, BobWETH;

  function addCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  beforeEach(async function() {



    // cUSDC, USDC, WETH contract address and function
    cUSDC_Contract = '0xc3d688B66703497DAA19211EEdff47f25384cdc3';
    cUSDC_ABI = [
        "function supply(address asset, uint amount) external",
        "function withdraw(address asset, uint amount) external",
    ]
    
    USDC_Contract = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    USDC_ABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
    ];

    WETH_Contract = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    WETH_ABI = [
        "function balanceOf(address account) public view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
    ];
    
    // Alice: an USDC holder who have more than 1000 USDC.
    USDCholderAddress = "0xCFFAd3200574698b78f32232aa9D63eABD290703";
    await helpers.impersonateAccount(USDCholderAddress);
    AliceSign = await ethers.getSigner(USDCholderAddress);

    // cUSDC and USDC Contract connect Alice
    AlicecUSDCv3 = new ethers.Contract(cUSDC_Contract, cUSDC_ABI, AliceSign);
    AliceUSDC = new ethers.Contract(USDC_Contract, USDC_ABI, AliceSign);

    // Bob: a WETH holder who hold more than 80% value of USDC in cUSDC Pool.
    WETHholderAddress = "0x8EB8a3b98659Cce290402893d0123abb75E3ab28";
    await helpers.impersonateAccount(WETHholderAddress);
    BobSign = await ethers.getSigner(WETHholderAddress);

    // cUSDC and WETH Contract connect Bob
    BobcUSDCv3 = new ethers.Contract(cUSDC_Contract, cUSDC_ABI, BobSign);
    BobWETH = new ethers.Contract(WETH_Contract, WETH_ABI, BobSign);

  });

  describe('On block 17228670', function () {

    /*
    USDCbalance: USDC balance in the Compound USDC contract.
    */
    it('Print USDC balance in the Compound USDC contract.', async function () {
      USDCbalance = await AliceUSDC.balanceOf(cUSDC_Contract);
      console.log('        USDC Balance:', addCommas(USDCbalance));
    });

    it('AliceSign provides liquidity (1000 USDC) into the Compound USDC contract.', async function () {
      await AliceUSDC.approve(cUSDC_Contract, 1000*1e6);
      await AlicecUSDCv3.supply(USDC_Contract, 1000*1e6);
      USDCbalance = await AliceUSDC.balanceOf(cUSDC_Contract);
      console.log('        USDC Balance after AliceSign provides liquiity:', addCommas(USDCbalance));
    });

    it('BobSign performs some setup which is collateralize some asset.', async function () {
      BobWETH_balance = await BobWETH.balanceOf(WETHholderAddress);
      await BobWETH.approve(cUSDC_Contract, BobWETH_balance);
      await BobcUSDCv3.supply(WETH_Contract, BobWETH_balance);
    });

    it('BobSign withdraws all the USDC balance.', async function () {
      await BobcUSDCv3.withdraw(USDC_Contract, USDCbalance);
    });

    it("the USDC balance in the Compound USDC contract, this should be 0.", async function () {
      USDCbalance = await AliceUSDC.balanceOf(cUSDC_Contract);
      console.log('        USDC Balance after BobSign withdraws all USDC in the Compound USDC contract:', addCommas(USDCbalance));
    });

    it('AliceSign tries to withdraw 1000 USDC, record what happened and print those out.', async function () {
      await AlicecUSDCv3.withdraw(USDC_Contract, 1000*1e6);
    });

  })

})