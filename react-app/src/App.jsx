import './App.css';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import MyNFT from './artifacts/contracts/MyNFT.sol/MyNFT.json';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, MyNFT.abi, signer);

function App() {
  const [minted, setMinted] = useState('Loading...');

  useEffect(() => {
    if (minted === 'Loading...') {
      getMinted();
    }
  });

  const getMinted = async () => {
    const supply = await contract.totalSupply();
    setMinted(supply.toString());
  }

  return (
    <div className="App">
      <p>Number of NFTs minted: {minted}</p>
    </div>
  );
}




// // async function mint() {
// //   if (typeof window.ethereum !== 'undefined') {

// //   }
// // }

// async function getNumMinted() {
//   return await contract.totalSupply();
// }

// const num = await getNumMinted();

// function App() {
//   // async function getNumMinted() {
//   //   if (typeof window.ethereum !== 'undefined') {
//   //     try {
//   //       const totalSupply = await contract.totalSupply();
//   //     } catch (err) {
//   //       console.log("Error: ", err);
//   //     }
//   //   }
//   // }

//   // const initialNumMinted = getNumMinted().resolve();
//   // console.log(initialNumMinted);

//   // const [numMinted, setNumMinted] = useState(initialNumMinted);

//   return (
//     <div className="App">
//       {/* <button onClick={mint}>Mint an NFT</button> */}
//       <p>Number of NFTs minted: {num}</p>
//     </div>
//   )
// }


  // call the smart contract, read the current greeting value
  // async function fetchGreeting() {
  //   if (typeof window.ethereum !== 'undefined') {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const contract = new ethers.Contract(contractAddress, MyNFT.abi, provider);
  //     try {
  //       const totalSupply = await contract.totalSupply();
  //       console.log('total supply: ', ethers.utils.formatEther( totalSupply ));
  //     } catch (err) {
  //       console.log("Error: ", err);
  //     }
  //   }    
  // }




// function App() {
//   // store greeting in local state
//   const [greeting, setGreetingValue] = useState()

//   // request access to the user's MetaMask account
//   async function requestAccount() {
//     await window.ethereum.request({ method: 'eth_requestAccounts' });
//   }

//   // call the smart contract, read the current greeting value
//   async function fetchGreeting() {
//     if (typeof window.ethereum !== 'undefined') {
//       const provider = new ethers.providers.Web3Provider(window.ethereum)
//       const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
//       try {
//         const data = await contract.greet()
//         console.log('data: ', data)
//       } catch (err) {
//         console.log("Error: ", err)
//       }
//     }    
//   }

//   // call the smart contract, send an update
//   async function setGreeting() {
//     if (!greeting) return
//     if (typeof window.ethereum !== 'undefined') {
//       await requestAccount()
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner()
//       const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
//       const transaction = await contract.setGreeting(greeting)
//       await transaction.wait()
//       fetchGreeting()
//     }
//   }

//   return (
//     <div className="App">
//       <header className="App-header">
//         <button onClick={fetchGreeting}>Fetch Greeting</button>
//         <button onClick={setGreeting}>Set Greeting</button>
//         <input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" />
//       </header>
//     </div>
//   );
// }
  
export default App;