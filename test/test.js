const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe('Simulation', function () {
  let cUSDC_Contract, cUSDC_ABI, USDC_Contract, USDC_ABI, WETH_Contract, WETH_ABI,
    USDCholderAddress, Alice, AlicecUSDC, AliceUSDC, WETHholderAddress, Bob, BobcUSDC, BobWETH;
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
    
    // Alice:　an USDC holder who have more than 1000 USDC.
    USDCholderAddress = "0xCFFAd3200574698b78f32232aa9D63eABD290703";
    await helpers.impersonateAccount(USDCholderAddress);
    Alice = await ethers.getSigner(USDCholderAddress);
    AlicecUSDC = new ethers.Contract(cUSDC_Contract, cUSDC_ABI, Alice);
    AliceUSDC = new ethers.Contract(USDC_Contract, USDC_ABI, Alice);

    // Bob: a WETH holder who hold more than 80% value of USDC in cUSDC Pool.
    WETHholderAddress = "0x8EB8a3b98659Cce290402893d0123abb75E3ab28";
    await helpers.impersonateAccount(WETHholderAddress);
    Bob = await ethers.getSigner(WETHholderAddress);
    BobcUSDC = new ethers.Contract(cUSDC_Contract, cUSDC_ABI, Bob);
    BobWETH = new ethers.Contract(WETH_Contract, WETH_ABI, Bob);

  });

  describe('On block 17228670', function () {

    it('Print USDC balance in the Compound USDC contract.', async function () {
      const USDCbalance = await AliceUSDC.balanceOf(cUSDC_Contract);
      console.log('        USDC Balance:', ethers.utils.formatUnits(USDCbalance.toString(), 6));
    });

    it('Alice provides liquidity (1000 USDC) into the Compound USDC contract.', async function () {
      await AliceUSDC.approve(cUSDC_Contract, ethers.utils.parseUnits("1000", 6));
      await AlicecUSDC.supply(USDC_Contract, ethers.utils.parseUnits("1000", 6));
      USDCbalance = await AliceUSDC.balanceOf(cUSDC_Contract);
      console.log('        USDC Balance after Alice provides liquiity:', ethers.utils.formatUnits(USDCbalance.toString(), 6));
    });

    it('Bob performs some setup which is collateralize some asset.', async function () {
      allBobBalance = await BobWETH.balanceOf(WETHholderAddress);
      await BobWETH.approve(cUSDC_Contract, allBobBalance);
      await BobcUSDC.supply(WETH_Contract, allBobBalance);
      WETHbalance = await BobWETH.balanceOf(cUSDC_Contract);
      allBobBalance = await BobWETH.balanceOf(WETHholderAddress);
      console.log('        WETH Balance after Bob provides liquiity:', ethers.utils.formatUnits(WETHbalance.toString(), 6));
    });

    it('Bob withdraws all the USDC balance.', async function () {
      await BobcUSDC.withdraw(USDC_Contract, USDCbalance);
    });

    it("the USDC balance in the Compound USDC contract, this should be 0.", async function () {
      USDCbalance = await AliceUSDC.balanceOf(cUSDC_Contract);
      console.log('        USDC Balance after Bob withdraws all USDC in the Compound USDC contract:', ethers.utils.formatUnits(USDCbalance.toString(), 6));
    });

    it('Alice tries to withdraw 1000 USDC, record what happened and print those out.', async function () {
      await AlicecUSDC.withdraw(USDC_Contract, ethers.utils.parseUnits("1000", 6));
    });

  })

})