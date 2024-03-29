const hre = require("hardhat");
const { ethers } = hre;

// const buyer_addr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
const buyer_addr = "0xf505B2b47BaC8849584915588bA3C0a01bd72206"
const owner_addr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const erc20_addr = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const machine_addr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

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

    // // Most of the time it's the same as `address`. 
    // // It could be some thing like a domain?
    // console.log("erc20 target: ", erc20.target);

    const machine_signer = await ethers.getSigner(machine_addr);
    console.log("owner machine balance: ", await machine.connect(machine_signer).balanceOf(owner_addr));
    console.log("buyer machine balance: ", await machine.connect(machine_signer).balanceOf(buyer_addr));
    console.log("machine balance: ", await machine.connect(machine_signer).balanceOf(machine_addr));
    const num_nfts = await machine.connect(machine_signer).get_num_nfts();
    for (i = 0; i < num_nfts; i++) {
        console.log(`token_${i}=\"${await machine.connect(machine_signer).tokenURI(i)}\"`)
    }
    console.log(`tokens info: ${await machine.connect(machine_signer).list_nfts()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
