const temporaryMaxPublic = 30;
const adminAddresses = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
];

async function main () {
  const MyNFT = await ethers.getContractFactory('MyNFT');
  console.log('Deploying MyNFT...');
  const myNFT = await MyNFT.deploy(temporaryMaxPublic, adminAddresses);
  await myNFT.deployed();
  console.log('myNFT deployed to:', myNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });