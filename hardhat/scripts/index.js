async function main () {
  // Retrieve accounts from the local node
  // const accounts = await ethers.provider.listAccounts();
  // console.log(accounts);

  // Set up an ethers contract, representing our deployed MyNFT instance
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const MyNFT = await ethers.getContractFactory('MyNFT');
  const myNFT = await MyNFT.attach(contractAddress);

  // Sends a transaction to mint a public token
  await myNFT.mintPublic();

  // Finds the owner of the public token that was just minted
  const owner = await myNFT.ownerOf(1);
  console.log('Owner: ', owner);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
 });




// // Test git
// require("dotenv").config();
// const { ethers } = require("ethers");

// const contract = require("../artifacts/contracts/EmotionalShapes.sol/EmotionalShapes.json");
// const contractInterface = contract.abi;

// // https://docs.ethers.io/v5/api/providers
// const provider = ethers.getDefaultProvider("ropsten", {
//   alchemy: process.env.DEV_API_URL,
// });

// // https://docs.ethers.io/v5/api/signer/#Wallet
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// //https://docs.ethers.io/v5/api/contract/contract
// const emotionalShapes = new ethers.Contract(
//   "0xdB8d16ab2fb26059E048631eE5A141241E1801C3",
//   contractInterface,
//   wallet
// );

// const main = () => {
//   emotionalShapes
//     .mint(process.env.PUBLIC_KEY)
//     .then((transaction) => console.log(transaction))
//     .catch((e) => console.log("something went wrong", e));
// };

// main();