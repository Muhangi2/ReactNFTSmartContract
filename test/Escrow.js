const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  it("saves the address", async () => {
    //signers  fake metamask accounts

    let realEstate, escrow;
    let buyer, seller, lender, inspector;

    [seller, buyer, lender, inspector] = await ethers.getSigners();
    console.log(seller, buyer, lender, inspector);

    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    console.log(realEstate.address);

    let transaction = await realEstate
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/1.png"
      );
    await transaction.wait();

    //ESCROWCONTRACT
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
    console.log(escrow.address);
  });
});
