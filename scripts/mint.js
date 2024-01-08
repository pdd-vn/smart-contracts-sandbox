const hre = require("hardhat");
const { ethers } = hre;

// erc20_addr = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
// machine_addr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
// owner_addr = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
// buyer_addr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

const erc20_addr = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const machine_addr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const owner_addr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const buyer_addr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
// const buyer_addr = "0xf505B2b47BaC8849584915588bA3C0a01bd72206"



async function main() {
    const erc20 = await ethers.getContractAt(
        "LME20T",
        erc20_addr
    );
    await erc20.mint("0x90f79bf6eb2c4f870365e785982e1f101e93b906", 100);

    // const machine = await ethers.getContractAt(
    //     "LendingMachine",
    //     machine_addr
    // );

    // const buyer = await ethers.getSigner(buyer_addr);
    // const owner = await ethers.getSigner(owner_addr);

    // await machine.connect(buyer).mint_new_nft("https://cdn-icons-png.flaticon.com/512/4155/4155897.png")

    // await machine.connect(buyer).mint_new_nft("https://cdn3.iconfinder.com/data/icons/role-playing-game-5/340/rpg_fantasy_medieval_paladin_shield_knight_crusader_cross-512.png")
    // await machine.connect(buyer).deposit(1, 10)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
