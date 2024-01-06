const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const typechain = require("../src/types");
const { token } = require("../src/types/@openzeppelin/contracts");


describe("LendingMachine", function () {
  function log_address(minter, buyer, erc20, machine) {
    console.log("minter: ", minter.address);
    console.log("buyer: ", buyer.address);
    console.log('erc20: ', erc20.target);
    console.log('machine: ', machine.target);
  }

  async function prepare() {
    // prepare accounts
    const accounts = await ethers.getSigners();
    const [minter, buyer] = accounts;

    // deploy erc20 and machine
    const erc20 = await new typechain.LME20T__factory(minter).deploy(minter.address);
    const machine = await new typechain.LendingMachine__factory(minter).deploy(erc20.target, 1);

    // mint token for buyer and minter
    await erc20.connect(minter).mint(buyer.address, 10);
    await erc20.connect(minter).mint(minter.address, 1000);

    // set approve for machine
    // await machine.connect(minter).setApprovalForAll(machine.target, true);
    return { minter, buyer, erc20, machine };
  }

  it("deployment", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);

    expect(await erc20.name.staticCall()).to.equal("LME20T");
    expect(await machine.name.staticCall()).to.equal("LendingMachine");
  });

  it("should mint new nft", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);

    expect(await machine.connect(minter).mint_new_nft("nft1.com")).to.emit(machine, "MintNewNFT");
    expect(await machine.connect(minter).mint_new_nft("nft2.com")).to.emit(machine, "MintNewNFT");
    expect(await machine.connect(minter).mint_new_nft("nft3.com")).to.emit(machine, "MintNewNFT");
  });

  it("should get all nft minted", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);

    expect(await machine.connect(minter).mint_new_nft("nft1.com")).to.emit(machine, "MintNewNFT");
    expect(await machine.connect(minter).mint_new_nft("nft2.com")).to.emit(machine, "MintNewNFT");
    expect(await machine.connect(minter).mint_new_nft("nft3.com")).to.emit(machine, "MintNewNFT");

    expect(await machine.connect(minter).tokenURI(0) == "nft1.com", "Wrong NFT uri");
    expect(await machine.connect(minter).tokenURI(1) == "nft2.com", "Wrong NFT uri");
    expect(await machine.connect(minter).tokenURI(2) == "nft3.com", "Wrong NFT uri");

    expect(await machine.connect(minter).get_num_nfts()).to.eq(3);
    console.log("All nfts: ", await machine.connect(minter).list_nfts());
  });

  it("should deposit nft successfully", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);
    expect(await machine.connect(buyer).mint_new_nft("nft1.com")).to.emit(machine, "MintNewNFT");

    // First nft always have id 0
    await machine.connect(buyer).deposit(0, 5);
    expect(await machine.connect(minter).balanceOf(buyer.address)).to.eq(0);
    // expect(await machine.connect(minter).balanceOf(machine.getAddress())).to.eq(1);
    expect(await machine.connect(minter).balanceOf(minter.address)).to.eq(1);

    expect(await machine.connect(buyer).mint_new_nft("nft2.com")).to.emit(machine, "MintNewNFT");
    await machine.connect(buyer).deposit(1, 5);
    expect(await machine.connect(minter).balanceOf(minter.address)).to.eq(2);
  });

  it("should lend nft successfully", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);
    expect(await machine.connect(buyer).mint_new_nft("nft1.com")).to.emit(machine, "MintNewNFT");

    // First nft always have id 0
    const price = 5;
    await machine.connect(buyer).deposit(0, price);
    expect(await machine.connect(minter).balanceOf(buyer.address)).to.eq(0);
    expect(await machine.connect(minter).balanceOf(minter.address)).to.eq(1);

    await erc20.connect(minter).approve(machine.getAddress(), price);
    await machine.connect(minter).lend(0);

    expect(await erc20.connect(buyer).balanceOf(buyer.address)).to.eq(15);
    expect(await erc20.connect(minter).balanceOf(minter.address)).to.eq(995);
  });

  it("should repay nft successfully", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);
    log_address(minter, buyer, erc20, machine);
    expect(await machine.connect(buyer).mint_new_nft("nft1.com")).to.emit(machine, "MintNewNFT");
    console.log("erc20 balance of buyer: ", await erc20.connect(buyer).balanceOf(buyer.address));
    console.log("erc20 blance of owner: ", await erc20.connect(minter).balanceOf(minter.address));

    // First nft always have id 0
    const price = 5;
    await machine.connect(buyer).deposit(0, price);
    expect(await machine.connect(minter).balanceOf(buyer.address)).to.eq(0);
    expect(await machine.connect(minter).balanceOf(minter.address)).to.eq(1);

    // Lend
    await erc20.connect(minter).approve(machine.getAddress(), price);
    await machine.connect(minter).lend(0);
    const owner = await machine.connect(minter).ownerOf(0);
    console.log("owner of token 0: ", owner);
    console.log("owner of machine: ", await machine.owner());
    console.log("erc20 balance of buyer: ", await erc20.connect(buyer).balanceOf(buyer.address));
    console.log("erc20 blance of owner: ", await erc20.connect(minter).balanceOf(minter.address));

    // Repay
    await erc20.connect(buyer).approve(machine.getAddress(), price);
    await machine.connect(minter).approve(buyer.address, 0);
    expect(await machine.connect(buyer).repay(0)).to.emit(machine, "Transfer");
    console.log("erc20 balance of buyer after repay: ", await erc20.connect(buyer).balanceOf(buyer.address));
    console.log("erc20 blance of owner after repay: ", await erc20.connect(minter).balanceOf(minter.address));

    // Check
    expect(await erc20.connect(buyer).balanceOf(buyer.address)).to.eq(10);
    expect(await erc20.connect(minter).balanceOf(minter.address)).to.eq(1000);
    expect(await machine.connect(minter).balanceOf(buyer.address)).to.eq(1);
    expect(await machine.connect(minter).balanceOf(minter.address)).to.eq(0);
  });
})