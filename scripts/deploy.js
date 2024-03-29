const hre = require("hardhat");
const { ethers } = hre;
const typechain = require("../src/types");

async function main() {
  // prepare accounts
  const accounts = await ethers.getSigners();
  const minter = accounts[0];
  const buyer = accounts[1];
  console.log("minter: ", minter.address);
  console.log("buyer: ", buyer.address);

  // deploy erc20 and machine
  const erc20 = await new typechain.LME20T__factory(minter).deploy(minter.address);
  console.log('erc20: ', erc20.target);

  const machine = await new typechain.LendingMachine__factory(minter).deploy(erc20.target, 1);
  console.log('machine: ', machine.target);

  // mint token for buyer
  await erc20.connect(minter).mint(buyer.address, 10);
  await erc20.connect(minter).mint(minter.address, 50);

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







