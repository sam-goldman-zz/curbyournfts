const temporaryMaxPublic = 40;
const adminAddresses = [
  "0x4856e043a1F2CAA8aCEfd076328b4981Aca91000",
];

async function main () {
  const Token = await ethers.getContractFactory('CurbYourNFT');
  console.log('Deploying Token...');
  const token = await Token.deploy(temporaryMaxPublic, adminAddresses);
  await token.deployed();
  const address = token.address;
  console.log('Token deployed to:', address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });