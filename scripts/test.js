const hre = require("hardhat");
const { ethers } = hre;

erc20_addr = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
machine_addr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
owner_addr = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
buyer_addr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

async function main() {
    const erc20 = await ethers.getContractAt(
        "LME20T",
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
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
    console.log("nft uri: ", await machine.connect(machine_signer).tokenURI(0));

    await erc20.connect(owner).approve(machine_addr, 100);
    await machine.connect(owner).lend(100, buyer_addr);
    console.log("buyer_erc20_balance: ", await erc20.balanceOf(buyer_addr));
    console.log("owner_erc20_balance: ", await erc20.balanceOf(owner_addr));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
