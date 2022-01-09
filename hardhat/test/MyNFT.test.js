// test/MyNFT.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants, snapshot } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = require('@openzeppelin/test-helpers/src/constants');

// Load compiled artifacts
const MyNFT = artifacts.require('MyNFT');

const revertMessages = {
  TmpPublicExceedsMaxPublic: "_temporaryMaxPublic cannot be greater than max public value",
  AdminAddressesLengthIsZero: "_adminAddresses length cannot be zero",
  AdminCannotBeZeroAddress: "admin cannot be zero address",
  NumTokensCannotBeZero: "numTokens cannot be zero",
  NumReservedTokensExceedsMax: "number of tokens requested exceeds max reserved",
  AddressReachedPublicMintingLimit: "this address has reached its minting limit",
  MaxNumberPublicTokensMinted: "maximum number of public tokens have been minted",
  PublicTokensExceedsTmpMax: "there are currently no more public tokens to mint",
  NewTmpMaxExceedsMaxPublic: "cannot change temporary public value to exceed max value"
};

const _0 = new BN('0');
const _1 = new BN('1');
const _2 = new BN('2');

const DEFAULT_ADMIN_ROLE = constants.ZERO_BYTES32;

const temporaryMaxPublic = new BN('30');

const tokenName = "MyNFT";
const tokenSymbol = "NFT";

// Start test block
contract('MyNFT', function ([ admin1, admin2, admin3, nonAdmin1, nonAdmin2, ...otherAccounts]) {
  let snapshotA;
  let maxPublic, maxReserved, maxPerPublicAddress;

  const adminAddresses = [admin1, admin2, admin3];

  function getRevertMessageAccessControl(address) {
    return `AccessControl: account ${address.toLowerCase()} is missing role ${ZERO_ADDRESS}`;
  }

  // mints one public token per account in otherAccounts
  async function mintPublicTokens(numTokens) {
    for (let i = 0; i < numTokens; i++) {
      address = otherAccounts[i];
      await this.myNFT.mintPublic({ from: address });
    }
  }

  before('deploy contracts', async () => {
    this.myNFT = await MyNFT.new(
      temporaryMaxPublic,
      adminAddresses
    );

    maxPublic = await this.myNFT.MAX_PUBLIC();
    maxReserved = await this.myNFT.MAX_RESERVED();
    maxPerPublicAddress = await this.myNFT.MAX_PER_PUBLIC_ADDRESS();
  });

  beforeEach(async () => {
    snapshotA = await snapshot();
  })

  afterEach(async () => {
    await snapshotA.restore()
  })

  describe('constructor', () => {
    it('verify deployment parameters', async () => {
      expect (await this.myNFT.totalSupply()).to.be.bignumber.equal(_0);

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

      // still works with one adminAddress
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
      expect(await this.myNFT.totalSupply()).to.be.bignumber.equal(numReservedTokens);

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

    it('check modifier - non-admin cannot mint reserved tokens', async () => {
      const revertMessageAccessControl = getRevertMessageAccessControl(nonAdmin1);

      await expectRevert(
        this.myNFT.mintReserved(1, { from: nonAdmin1 }),
        revertMessageAccessControl
      );
    })
  })

  describe('mintPublic', () => {
    it('happy case', async () => {
      await this.myNFT.mintPublic({ from: nonAdmin1 });
      await this.myNFT.mintPublic({ from: nonAdmin2 });

      expect(await this.myNFT.totalSupply()).to.be.bignumber.equal(_2);

      expect(await this.myNFT.balanceOf(nonAdmin1)).to.be.bignumber.equal(_1);
      expect(await this.myNFT.balanceOf(nonAdmin2)).to.be.bignumber.equal(_1);

      expect(await this.myNFT.ownerOf(_1)).to.equal(nonAdmin1);
      expect(await this.myNFT.ownerOf(_2)).to.equal(nonAdmin2);
    })

    it('require fail - address has reached public minting limit', async () => {
      for (let i = 0; i < maxPerPublicAddress; i++) {
        await this.myNFT.mintPublic({ from: nonAdmin1 });
      }

      await expectRevert(
        this.myNFT.mintPublic({ from: nonAdmin1 }),
        revertMessages.AddressReachedPublicMintingLimit
      );
    })

    it('require fail - maximum number of public tokens minted', async () => {
      await this.myNFT.setTemporaryMaxPublic(maxPublic, { from: admin1 });

      await mintPublicTokens(maxPublic);

      await expectRevert(
        this.myNFT.mintPublic({ from: nonAdmin1 }),
        revertMessages.MaxNumberPublicTokensMinted
      );
    });

    it('require fail - number of public tokens minted exceeds temporary max public value', async () => {
      await mintPublicTokens(temporaryMaxPublic);

      await expectRevert(
        this.myNFT.mintPublic({ from: nonAdmin1 }),
        revertMessages.PublicTokensExceedsTmpMax
      );
    })
  })

  describe('setTemporaryMaxPublic', () => {
    it('happy case', async () => {
      const newTemporaryMaxPublic = new BN('35');

      await this.myNFT.setTemporaryMaxPublic(newTemporaryMaxPublic, { from: admin1 });
      expect(await this.myNFT.temporaryMaxPublic()).to.be.bignumber.equal(newTemporaryMaxPublic);
    })

    it('require fail - new temporary public value cannot exceed max public value', async () => {
      await expectRevert(
        this.myNFT.setTemporaryMaxPublic(maxPublic.add(_1), { from: admin1 }),
        revertMessages.NewTmpMaxExceedsMaxPublic
      );

      // still works when temporaryMaxPublic = maxPublic
      await this.myNFT.setTemporaryMaxPublic(maxPublic, { from: admin1 });
      expect(await this.myNFT.temporaryMaxPublic()).to.be.bignumber.equal(maxPublic)
    })

    it('check modifier - non-admin cannot set new temporaryMaxPublic', async () => {
      const revertMessageAccessControl = getRevertMessageAccessControl(nonAdmin1);

      getRevertMessageAccessControl(address);

      await expectRevert(
        this.myNFT.setTemporaryMaxPublic(maxPublic, { from: nonAdmin1 }),
        revertMessageAccessControl
      );
    })
  })

  describe('mint all tokens', () => {
    it('happy case - mint all tokens', async () => {
      await this.myNFT.setTemporaryMaxPublic(maxPublic, { from: admin1 });

      await mintPublicTokens(maxPublic);

      await this.myNFT.mintReserved(maxReserved, { from: admin1 });
  
      expect(await this.myNFT.totalSupply()).to.be.bignumber.equal(maxPublic.add(maxReserved));
    })
  })

  // it('store emits an event', async function () {
  //   const receipt = await this.myNFT.store(value, { from: owner });

  //   // Test that a ValueChanged event was emitted with the new value
  //   expectEvent(receipt, 'ValueChanged', { value: value });
  // });
});