// test/MyNFT.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants, snapshot } = require('@openzeppelin/test-helpers');
const { unspecified } = require('@openzeppelin/test-helpers/src/expectRevert');
const { ZERO_ADDRESS } = require('@openzeppelin/test-helpers/src/constants');

// Load compiled artifacts
const MyNFT = artifacts.require('MyNFT');

const revertMessages = {
  TmpPublicExceedsMaxPublic: "_temporaryMaxPublic cannot be greater than max public value",
  AdminAddressesLengthIsZero: "_adminAddresses length cannot be zero",
  AdminCannotBeZeroAddress: "admin cannot be zero address",
  NumTokensCannotBeZero: "numTokens cannot be zero",
  NumReservedTokensExceedsMax: "number of tokens requested exceeds max reserved"
};

const _0 = new BN('0');
const _1 = new BN('1');
const _2 = new BN('2');

const DEFAULT_ADMIN_ROLE = constants.ZERO_BYTES32;

const temporaryMaxPublic = new BN('3000');

const tokenName = "MyNFT";
const tokenSymbol = "NFT";

// Start test block
contract('MyNFT', function ([ admin1, admin2, admin3, nonAdmin ]) {

  let snapshotA;
  let maxPublic;

  const adminAddresses = [admin1, admin2, admin3];

  before('deploy contracts', async () => {
    this.myNFT = await MyNFT.new(
      temporaryMaxPublic,
      adminAddresses
    );

    maxPublic = await this.myNFT.MAX_PUBLIC();
    maxReserved = await this.myNFT.MAX_RESERVED();
  });

  beforeEach(async () => {
    snapshotA = await snapshot();
  })

  afterEach(async () => {
    await snapshotA.restore()
  })

  describe('constructor', () => {
    it('verify deployment parameters', async () => {
      expect(await this.myNFT.temporaryMaxPublic()).to.be.bignumber.equal(temporaryMaxPublic);

      for (let adminAddress of adminAddresses) {
        expect(await this.myNFT.hasRole(DEFAULT_ADMIN_ROLE, adminAddress)).to.equal(true);
      };

      expect(await this.myNFT.name()).to.equal(tokenName);

      expect(await this.myNFT.symbol()).to.equal(tokenSymbol);
    });

    it('require fail - temporary public value exceeds max public value', async () => {
      await expectRevert(
        MyNFT.new(
          maxPublic + 1,
          adminAddresses
        ),
        revertMessages.TmpPublicExceedsMaxPublic
      );

      // still works with 1 less
      this.myNFTTemp = await MyNFT.new(
        maxPublic,
        adminAddresses
      );

      expect(await this.myNFTTemp.temporaryMaxPublic()).to.be.bignumber.equal(maxPublic);
    });

    it('require fail - admin addresses length is zero', async () => {
      await expectRevert(
        MyNFT.new(
          temporaryMaxPublic,
          []
        ),
        revertMessages.AdminAddressesLengthIsZero
      );

      // still works with length of 1
      this.myNFTTemp = await MyNFT.new(
        temporaryMaxPublic,
        [adminAddresses[0]]
      );
      expect(await this.myNFTTemp.temporaryMaxPublic()).to.be.bignumber.equal(temporaryMaxPublic);
    })

    it('require fail - admin cannot be zero address', async () => {
      await expectRevert(
        MyNFT.new(
          temporaryMaxPublic,
          [constants.ZERO_ADDRESS]
        ),
        revertMessages.AdminCannotBeZeroAddress
      );
    })
  })

  describe('mintReserved', () => {
    const numReservedTokens = new BN('2');

    beforeEach(async () => {
      await this.myNFT.mintReserved(numReservedTokens, { from: admin1 });
    });

    it('happy case', async () => {
      expect(await this.myNFT.balanceOf(admin1)).to.be.bignumber.equal(numReservedTokens);
      
      expect(await this.myNFT.ownerOf(maxPublic.add(_1))).to.equal(admin1);
      expect(await this.myNFT.ownerOf(maxPublic.add(_2))).to.equal(admin1);
    });

    it('require fail - number of tokens cannot be zero', async () => {
      await expectRevert(
        this.myNFT.mintReserved(0, { from: admin1 }),
        revertMessages.NumTokensCannotBeZero
      );

      // still works for 1 token
      await this.myNFT.mintReserved(1, { from: admin1 });
      expect(await this.myNFT.balanceOf(admin1)).to.be.bignumber.equal(new BN('3'));
    })

    it('require fail - number of tokens exceeds max reserved', async () => {
      const numReservedTokensRemaining = maxReserved.sub(numReservedTokens);

      await expectRevert(
        this.myNFT.mintReserved(numReservedTokensRemaining.add(_1)),
        revertMessages.NumReservedTokensExceedsMax
      );

      // still works with 1 less
      await this.myNFT.mintReserved(numReservedTokensRemaining, { from: admin1 });
      expect(await this.myNFT.balanceOf(admin1)).to.be.bignumber.equal(maxReserved);
    })

    it("check modifier - non-admin cannot mint reserved tokens", async () => {
      const revertMessageAccessControl = `AccessControl: account ${nonAdmin.toLowerCase()} is missing role ${ZERO_ADDRESS}`;

      await expectRevert(
        this.myNFT.mintReserved(1, { from: nonAdmin }),
        revertMessageAccessControl
      );
    })
  })

  // it('store emits an event', async function () {
  //   const receipt = await this.myNFT.store(value, { from: owner });

  //   // Test that a ValueChanged event was emitted with the new value
  //   expectEvent(receipt, 'ValueChanged', { value: value });
  // });
});