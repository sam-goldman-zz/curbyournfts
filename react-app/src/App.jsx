import './App.css';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import MyNFT from './artifacts/contracts/MyNFT.sol/MyNFT.json';

const adminAddresses = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
];

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, MyNFT.abi, signer);

function App() {
  // const [account, setAccount] = useState('');
  const [minted, setMinted] = useState('');
  const [mintingLimitReached, setMintingLimitReached] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    if (minted === '') {
      getMinted();
    }
  });

  window.ethereum.on('accountsChanged', function (accounts) {
    if (accounts.length === 0) {
      setWalletConnected(false);
    }
  });

  const requestAccount = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  }

  const getMinted = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const supply = await contract.totalSupply();
      setMinted(supply.toString());
    }
  }

  const mint = async () => {
    if (typeof window.ethereum !== undefined) {
      try {
        const tx = await contract.mintPublic();
        console.log(tx);
        const newMinted = parseInt(minted)+1;
        setMinted(newMinted.toString());
      } catch (err) {
        console.log(err.data.message);
        setMintingLimitReached(true);
      }
    }
  }

  // if (account === '') {
  //   requestAccount();
  // }
  const connectWalletButton = walletConnected ? 
    <button disabled>CONNECTED</button> : 
    <button onClick={requestAccount}>CONNECT WALLET</button>;

  const mintingLimitMsg = mintingLimitReached ?
    <p>"You have reached your minting limit!"</p> :
    "";

  return (
    <div className="App">
      {connectWalletButton}
      <h1>NFT</h1>
      <h2>PROJECT</h2>
      <button onClick={mint}>MINT</button>
      <p>Minted: {minted}/50</p>
      {mintingLimitMsg}
      <div>description</div>
      <div><a href="">View the contract</a></div>
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