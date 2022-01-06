// test/MyNFT.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const MyNFT = artifacts.require('MyNFT');

const revertMessages = {
  TmpPublicExceedsMaxPublic: "_temporaryMaxPublic cannot be greater than max public value",
  AdminAddressesLengthIsZero: "_adminAddresses length cannot be zero",
  AdminCannotBeZeroAddress: "admin cannot be zero address"
};

const _0 = new BN('0');
const _1 = new BN('1');

const DEFAULT_ADMIN_ROLE = constants.ZERO_BYTES32;

const temporaryMaxPublic = new BN('3000');
const adminAddresses = [
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
];

const tokenName = "MyNFT";
const tokenSymbol = "NFT";

// Start test block
contract('MyNFT', function ([ owner, other ]) {

  before('deploy contracts', async () => {
    this.myNFT = await MyNFT.new(
      temporaryMaxPublic,
      adminAddresses
    );
  });

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
      const maxPublic = await this.myNFT.MAX_PUBLIC();
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

    // it('non owner cannot store a value', async function () {
  //   // Test a transaction reverts
  //   await expectRevert(
  //     this.myNFT.store(value, { from: other }),
  //     'Ownable: caller is not the owner',
  //   );
  // });

  // const value = new BN('42');
  // const maxPerAddress = new BN('3');
  // const maxPublic = new BN('3000');
  // const maxReserved = new BN('1000');
  // const startingReservedId = new BN('2000');

  // beforeEach(async function () {
  //   this.myNFT = await MyNFT.new(maxPublic, maxReserved, startingReservedId, maxPerAddress, adminAddresses, { from: owner });
  // });

  // it('retrieve returns a value previously stored', async function () {
  //   await this.myNFT.store(value, { from: owner });

  //   // Use large integer comparisons
  //   expect(await this.myNFT.retrieve()).to.be.bignumber.equal(value);
  // });

  // it('store emits an event', async function () {
  //   const receipt = await this.myNFT.store(value, { from: owner });

  //   // Test that a ValueChanged event was emitted with the new value
  //   expectEvent(receipt, 'ValueChanged', { value: value });
  // });
});