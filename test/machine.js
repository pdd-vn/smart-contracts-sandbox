const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const typechain = require("../src/types");

describe("Machine", function () {
  async function prepare() {

    // prepare accounts
    const accounts = await ethers.getSigners();
    const [minter, buyer] = accounts;

    // deploy erc20 and machine
    const erc20 = await new typechain.MyERC20Token__factory(minter).deploy(minter.address);
    const machine = await new typechain.NFTMachine__factory(minter).deploy(erc20.target);
    // mint token for buyer
    await erc20.connect(minter).mint(buyer.address, 10);

    // set approve for machine
    await machine.connect(minter).setApprovalForAll(machine.target, true);

    return { minter, buyer, erc20, machine };
  }

  it("deployment", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);

    expect(await erc20.name.staticCall()).to.equal("MyToken");
    expect(await machine.name.staticCall()).to.equal("MyNFTToken");
  });

  it("should mint new nft", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);

    expect(await machine.connect(minter).mintNewNFT("nft1.com", 1)).to.emit(machine, "Transfer");
    expect(await machine.connect(minter).mintNewNFT("nft2.com", 1)).to.emit(machine, "Transfer");
    expect(await machine.connect(minter).mintNewNFT("nft3.com", 1)).to.emit(machine, "Transfer");
  });

  it("should get all nft minted", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);

    expect(await machine.connect(minter).mintNewNFT("nft1.com", 1)).to.emit(machine, "Transfer");
    expect(await machine.connect(minter).mintNewNFT("nft2.com", 1)).to.emit(machine, "Transfer");
    expect(await machine.connect(minter).mintNewNFT("nft3.com", 1)).to.emit(machine, "Transfer");

    const allNFTs = await machine.getAllNFT.staticCall();
    expect(allNFTs.length).to.equal(3);
  });

  it("should sell nft successfully", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);

    expect(await machine.connect(minter).mintNewNFT("nft1.com", 1)).to.emit(machine, "Transfer");
    expect(await machine.connect(minter).mintNewNFT("nft2.com", 1)).to.emit(machine, "Transfer");
    expect(await machine.connect(minter).mintNewNFT("nft3.com", 1)).to.emit(machine, "Transfer");

    await erc20.connect(buyer).approve(machine.target, 1);
    expect(await machine.connect(buyer).buyNFT(0)).to.emit(machine, "Transfer");
    expect(await machine.ownerOf.staticCall(0)).to.equal(buyer.address);
  });
});







