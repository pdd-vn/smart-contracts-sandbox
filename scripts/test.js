const hre = require("hardhat");
const { ethers } = hre;

erc20_addr = "0x27566bEb67F55a12860bc3DaA50fF57B3dE76183"
machine_addr = "0x6168c921c5425859F64a21940bC9841521cf0284"
owner_addr = "0xf505B2b47BaC8849584915588bA3C0a01bd72206"
buyer_addr = "0x59B15B86550259199B4534cE075986E6CC1B4412"

async function main() {
    const erc20 = await ethers.getContractAt(
        "LME20T",
        erc20_addr
    );
    const provider = ethers.provider;
    const machine = await ethers.getContractAt(
        "LendingMachine",
        machine_addr
    );

    console.log("buyer_erc20_balance: ", await erc20.balanceOf(buyer_addr));
    console.log("buyer_eth_balance: ", await provider.getBalance(buyer_addr));

    console.log("owner_erc20_balance: ", await erc20.balanceOf(owner_addr));
    console.log("owner_eth_balance: ", await provider.getBalance(owner_addr));

    // Most of the time it's the same as `address`. 
    // It could be some thing like a domain?
    console.log("erc20 target: ", erc20.target);

    const owner = await ethers.getSigner(owner_addr);
    const machine_signer = await ethers.getSigner(machine_addr);

    console.log("owner machine balance: ", await machine.connect(machine_signer).balanceOf(owner_addr));
    console.log("buyer machine balance: ", await machine.connect(machine_signer).balanceOf(buyer_addr));
    console.log("machine balance: ", await machine.connect(machine_signer).balanceOf(machine_addr));
    // console.log("nft uri: ", await machine.connect(machine_signer).tokenURI(0));

    // await erc20.connect(owner).approve(machine_addr, 100);
    // await machine.connect(owner).lend(100, buyer_addr);
    // console.log("buyer_erc20_balance: ", await erc20.balanceOf(buyer_addr));
    // console.log("owner_erc20_balance: ", await erc20.balanceOf(owner_addr));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
