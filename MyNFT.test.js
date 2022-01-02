// test/MyNFT.test.js
// Load dependencies
const { expect } = require('chai');

// Start test block
describe('MyNFT', function () {
  before(async function () {
    this.MyNFT = await ethers.getContractFactory('MyNFT');
  });

  beforeEach(async function () {
    this.myNFT = await this.MyNFT.deploy();
    await this.myNFT.deployed();
  });

  // Test case
  it('retrieve returns a value previously stored', async function () {
    // Store a value
    await this.myNFT.store(42);

    // Test if the returned value is the same one
    // Note that we need to use strings to compare the 256 bit integers
    expect((await this.myNFT.retrieve()).toString()).to.equal('42');
  });
});