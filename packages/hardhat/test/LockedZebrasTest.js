const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("YourCollectible Contract", function () {
  let collectibleContract;
  let myCollectibleContract;
  let owner;
  let addr1;

  const GORILLA = 0;
  const BUFFALO = 1;
  const ZEBRA = 2;

  const tokenUri =
    "https://ipfs.io/ipfs/Qma85p78WrcaLqfBEXJBJC1DgUcjVu5eZbwjwhG5ngu7Hy/{id}.json";

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    collectibleContract = await ethers.getContractFactory("YourCollectible");
    [owner, addr1] = await ethers.getSigners();

    myCollectibleContract = await collectibleContract.deploy({
      from: owner.address,
      args: [tokenUri],
    });

    await myCollectibleContract.mint(owner.address, GORILLA, 5, [], {
      gasLimit: 400000,
    });
    await myCollectibleContract.mint(owner.address, BUFFALO, 10, [], {
      gasLimit: 400000,
    });
    await myCollectibleContract.mint(owner.address, ZEBRA, 2, [], {
      gasLimit: 400000,
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      let ownerGorilasBalance = await myCollectibleContract.balanceOf(
        owner.address,
        GORILLA
      );
      expect(ownerGorilasBalance).to.equal(5);

      await myCollectibleContract.safeTransferFrom(
        owner.address,
        addr1.address,
        GORILLA,
        2,
        "0x3131"
      );

      const addr1GorilasBalance = await myCollectibleContract.balanceOf(
        addr1.address,
        GORILLA
      );
      expect(addr1GorilasBalance).to.equal(2);

      // balance deducted after transfer
      ownerGorilasBalance = await myCollectibleContract.balanceOf(
        owner.address,
        GORILLA
      );
      expect(ownerGorilasBalance).to.equal(3);
    });

    it("Should transfer zebras if account has atleast 5 gorillas", async function () {
      const ownerGorilasBalance = await myCollectibleContract.balanceOf(
        owner.address,
        GORILLA
      );
      expect(ownerGorilasBalance).to.equal(5);

      const ownerZebrasBalance = await myCollectibleContract.balanceOf(
        owner.address,
        ZEBRA
      );
      expect(ownerZebrasBalance).to.equal(2);

      await myCollectibleContract.safeTransferFrom(
        owner.address,
        addr1.address,
        ZEBRA,
        1,
        "0x3131"
      );

      const addr1ZebrasBalance = await myCollectibleContract.balanceOf(
        addr1.address,
        ZEBRA
      );
      expect(addr1ZebrasBalance).to.equal(1);
    });

    it("Should fail transferring zebras if account has less than 5 gorillas", async function () {
      let ownerGorilasBalance = await myCollectibleContract.balanceOf(
        owner.address,
        GORILLA
      );
      expect(ownerGorilasBalance).to.equal(5);

      await myCollectibleContract.safeTransferFrom(
        owner.address,
        addr1.address,
        GORILLA,
        2,
        "0x3131"
      );

      ownerGorilasBalance = await myCollectibleContract.balanceOf(
        owner.address,
        GORILLA
      );
      expect(ownerGorilasBalance).to.equal(3);

      await expect(
        myCollectibleContract.safeTransferFrom(
          owner.address,
          addr1.address,
          ZEBRA,
          1,
          "0x3131"
        )
      ).to.be.revertedWith(
        "Zebras are locked. You should have at least 5 gorillas to unlock zebras"
      );
    });
  });
});
