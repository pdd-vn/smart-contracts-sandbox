const hre = require("hardhat");
const { ethers } = hre;
const typechain = require("../src/types");

async function main() {
  // prepare accounts
  const accounts = await ethers.getSigners();
  const minter = accounts[0];
  const buyer = accounts[1];
  console.log('prepare accounts');

  // deploy erc20 and machine
  const erc20 = await new typechain.MyERC20Token__factory(minter).deploy(minter.address);
  console.log('erc20: ', erc20.target);

  const machine = await new typechain.NFTMachine__factory(minter).deploy(erc20.target);
  console.log('machine: ', machine.target);

  // mint token for buyer
  let tx = await erc20.connect(minter).mint(buyer.address, 10);
  console.log('tx mint token: ', tx.hash);

  // set approve for machine
  tx = await machine.connect(minter).setApprovalForAll(machine.target, true);
  console.log('tx approve all for machine: ', tx.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});







