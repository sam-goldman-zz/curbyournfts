const temporaryMaxPublic = 4;
const adminAddresses = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
];

async function main () {
  const Token = await ethers.getContractFactory('CurbYourNFT');
  console.log('Deploying Token...');
  const token = await Token.deploy(temporaryMaxPublic, adminAddresses);
  await token.deployed();
  console.log('Token deployed to:', token.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });