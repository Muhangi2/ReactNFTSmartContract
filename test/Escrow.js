const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  //signers  fake metamask accounts
  let realEstate, escrow;
  let seller, lender, inspector;
  let result;

  beforeEach(async () => {
    [seller, lender, inspector] = await ethers.getSigners();
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();

    //ESCROWCONTRACT
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      realEstate.address,
      seller.address,
      inspector.address,
      lender.address
    );
    //transctioninwallets
    let transaction = await realEstate
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/1.png"
      );
    await transaction.wait();

    transaction = await realEstate.connect(seller).approve(escrow.address, 1);
    await transaction.wait();

    transaction = await escrow.connect(seller).list(1);
    await transaction.wait();
  });
  //deployment
  describe("Deployment", () => {
    it("returns the NFT address", async () => {
      result = await escrow.nftAddress();
      expect(result).to.be.equal(realEstate.address);
    });

    it("returns the selller address", async () => {
      result = await escrow.seller();
      expect(result).to.be.equal(seller.address);
    });

    it("returns the lender address", async () => {
      result = await escrow.lender();
      expect(result).to.be.equal(lender.address);
    });

    it("returns the inspector address", async () => {
      result = await escrow.inspector();
      expect(result).to.be.equal(inspector.address);
    });
  });

  //listing
  describe("listing", () => {
    it("update ownership", async () => {
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
    });
  });
});

//deployment tests
