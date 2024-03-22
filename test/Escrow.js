const { wait } = require("@testing-library/user-event/dist/utils");
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
    [buyer, seller, lender, inspector] = await ethers.getSigners();
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

    transaction = await escrow
      .connect(seller)
      .list(1, buyer.address, tokens(10), tokens(5));
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
    it("is the NFT listed", async () => {
      const result = await escrow.islisted(1);
      expect(result).to.be.equal(true);
    });
    it("returns the buyer", async () => {
      const result = await escrow.buyer(1);
      expect(result).to.be.equal(buyer.address);
    });
    it("returns a purchase price", async () => {
      const result = await escrow.purchasePrice(1);
      expect(result).to.be.equal(tokens(10));
    });
    it("returns escrowAmount", async () => {
      const result = await escrow.escrowAmount(1);
      expect(result).to.be.equal(tokens(5));
    });
  });
  describe("contract balanace", () => {
    it("update contract balance", async () => {
      const transaction = await escrow
        .connect(buyer)
        .depositEther(1, { value: tokens(5) });
      await transaction.wait();
      //lets get the balance
      const result = await escrow.getBalance();
      expect(result).to.be.equal(tokens(5));
    });
  });

  describe("inspection", () => {
    it("update inspection status", async () => {
      const transaction = await escrow
        .connect(inspector)
        .updateInspectionStatus(1, true);
      await transaction.wait();
      const result = await escrow.inspectionPassed(1);
      expect(result).to.be.equal(true);
    });
  });
  describe("approval", () => {
    it("update approval status", async () => {
      let transaction = await escrow.connect(buyer).approvetheSale(1);
      await transaction.wait();
      transaction = await escrow.connect(seller).approvetheSale(1);
      await transaction.wait();
      transaction = await escrow.connect(lender).approvetheSale(1);
      await transaction.wait();

      expect(await escrow.approval(1, buyer.address)).to.be.equal(true);
      expect(await escrow.approval(1, seller.address)).to.be.equal(true);
      expect(await escrow.approval(1, lender.address)).to.be.equal(true);
    });
  });
  describe("sales", async () => {
    beforeEach(async () => {
      let transaction = await escrow
        .connect(buyer)
        .depositEther(1, { value: tokens(5) });
      await transaction.wait();
      transaction = await escrow
        .connect(inspector)
        .updateInspectionStatus(1, true);
      await transaction.wait();

      transaction = await escrow.connect(buyer).approvaltheSale(1);
      await transaction.wait();

      transaction = await escrow.connect(seller).approvaltheSale(1);
      await transaction.wait();

      transaction = await escrow.connect(lender).approvaltheSale(1);
      await transaction.wait();

      await lender.sendTransaction({ to: escrow.address, value: tokens(5) });
      await transaction.wait();

      transaction = await escrow.connect(seller).conductSales(1);
      await transaction.wait();
    });
    // it("it works",async()=>{})
  });
});

//deployment tests
