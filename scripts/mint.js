const hre = require("hardhat");
const { ethers } = hre;

erc20_addr = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
machine_addr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
owner_addr = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
buyer_addr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

async function main() {
    const erc20 = await ethers.getContractAt(
        "MyERC20Token",
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    await erc20.mint(owner_addr, 1000);

    const machine = await ethers.getContractAt(
        "NFTMachine",
        machine_addr
    );

    const buyer = await ethers.getSigner(buyer_addr);
    await machine.connect(buyer).mintNewNFT("www.example.com", 10, 3)

    // const owner = await ethers.getSigner(owner_addr);
    // await machine.connect(owner).mintNewNFT("www.example.com", 10, 5)
    console.log(await machine.getAllNFT())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
