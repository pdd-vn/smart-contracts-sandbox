const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const typechain = require("../src/types");
const { token } = require("../src/types/@openzeppelin/contracts");

describe("LendingMachine", function () {
  async function prepare() {

    // prepare accounts
    const accounts = await ethers.getSigners();
    const [minter, buyer] = accounts;

    // deploy erc20 and machine
    const erc20 = await new typechain.LME20T__factory(minter).deploy(minter.address);
    const machine = await new typechain.LendingMachine__factory(minter).deploy(erc20.target, 10);

    // mint token for buyer and minter
    await erc20.connect(minter).mint(buyer.address, 10);
    await erc20.connect(minter).mint(minter.address, 1000);

    // set approve for machine
    await machine.connect(minter).setApprovalForAll(machine.target, true);
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

    expect(await machine.connect(minter).get_num_nfts() == 3, "Wrong number of nfts");
  });

  it("should deposit nft successfully", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);
    expect(await machine.connect(buyer).mint_new_nft("nft1.com")).to.emit(machine, "MintNewNFT");

    // First nft always have id 0
    await machine.connect(buyer).deposit(0, 5);
    expect(await machine.connect(minter).balanceOf(buyer.address) == 0, "Buyer Lending Machine balance should be 0");
    expect(await machine.connect(minter).balanceOf(machine.getAddress()) == 1, "Lending Machine balance should be 1");

    expect(await machine.connect(buyer).mint_new_nft("nft2.com")).to.emit(machine, "MintNewNFT");
    await machine.connect(buyer).deposit(1, 5);
    expect(await machine.connect(minter).balanceOf(machine.getAddress()) == 2, "Lending Machine balance should be 2");
  });

  it("should lend nft successfully", async function () {
    const { minter, buyer, erc20, machine } = await loadFixture(prepare);
    expect(await machine.connect(buyer).mint_new_nft("nft1.com")).to.emit(machine, "MintNewNFT");

    // First nft always have id 0
    const price = 5;
    await machine.connect(buyer).deposit(0, price);
    expect(await machine.connect(minter).balanceOf(buyer.address) === 0, "Buyer Lending Machine balance should be 0");
    expect(await machine.connect(minter).balanceOf(machine.getAddress()) === 1, "Lending Machine balance should be 1");

    await erc20.connect(minter).approve(machine.getAddress(), price);
    await machine.connect(minter).lend(0);
    const buyer_erc20_balance = await erc20.connect(buyer).balanceOf(buyer.address);
    const minter_erc20_balance = await erc20.connect(minter).balanceOf(minter.address);
    console.log("buyer_erc20_balance: ", buyer_erc20_balance == 1);
    console.log("minter_erc20_balance: ", minter_erc20_balance);

    // expect(await erc20.connect(buyer).balanceOf(buyer.address) === 15, "Buyer LME20T balance should be 15");
    // expect(await erc20.connect(minter).balanceOf(minter.address) === 995, "Buyer LME20T balance should be 995");
  });

});







