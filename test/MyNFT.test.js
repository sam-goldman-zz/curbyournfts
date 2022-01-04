// test/MyNFT.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const MyNFT = artifacts.require('MyNFT');

const deploymentConfig = {
  'MAX_PUBLIC': new BN('3000'),
  'MAX_RESERVED': new BN('1000'),
  'STARTING_RESERVED_ID': new BN('2000'),
  'MAX_PER_ADDRESS': new BN('5')
};

const adminAddresses = [
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
];

// Start test block
contract('MyNFT', function ([ owner, other ]) {
  before('deploy contracts', async () => {
    this.myNFT = await MyNFT.new(
      deploymentConfig.MAX_PUBLIC,
      deploymentConfig.MAX_RESERVED,
      deploymentConfig.STARTING_RESERVED_ID,
      deploymentConfig.MAX_PER_ADDRESS,
      adminAddresses,
    );
  });

  describe('constructor', () => {
    it('verify deployment parameters', async () => {

      // const maxPublic = await this.myNFT.maxPublic()
      // assert.equal(+maxPublic, deploymentConfig.MAX_PUBLIC)
      expect(await this.myNFT.maxPublic()).to.be.bignumber.equal(deploymentConfig.MAX_PUBLIC);

      expect(await this.myNFT.maxReserved()).to.be.bignumber.equal(deploymentConfig.MAX_RESERVED);

      expect(await this.myNFT.startingReservedId()).to.be.bignumber.equal(deploymentConfig.STARTING_RESERVED_ID);

      expect(await this.myNFT.maxPerAddress()).to.be.bignumber.equal(deploymentConfig.MAX_PER_ADDRESS);
    });
  })

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

  // it('non owner cannot store a value', async function () {
  //   // Test a transaction reverts
  //   await expectRevert(
  //     this.myNFT.store(value, { from: other }),
  //     'Ownable: caller is not the owner',
  //   );
  // });
});