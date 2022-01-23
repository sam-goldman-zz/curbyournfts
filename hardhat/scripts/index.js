async function main () {
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const Token = await ethers.getContractFactory('CurbYourNFT');
  const token = await Token.attach(contractAddress);

  // Sends a transaction to mint a public token
  await token.mintPublic();

  // Finds the owner of the public token that was just minted
  const owner = await token.ownerOf(1);
  console.log('Owner: ', owner);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
 });