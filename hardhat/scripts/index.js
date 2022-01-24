async function main () {
  const contractAddress = '0x4a3844F8B63ffb024aE7b5d3BD613f8AD7bcB43b';
  const Token = await ethers.getContractFactory('CurbYourNFT');
  const token = await Token.attach(contractAddress);

  const baseUri = "https://bafybeih6gclhqd3mlwozlwrk6o7sgdsylaok2atzr6ujdzjqapieqximj4.ipfs.dweb.link/metadata/";
  await token.setBaseTokenURI(baseUri);

  console.log(await token.tokenURI(41));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
 });