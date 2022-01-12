import './App.css';
import { ethers } from 'ethers';
import { useState } from 'react';
import MyNFT from './artifacts/contracts/MyNFT.sol/MyNFT.json';
import detectEthereumProvider from '@metamask/detect-provider';

const adminAddresses = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
];

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

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

function App() {
  const [providerOrSigner, setProviderOrSigner] = useState(new ethers.providers.JsonRpcProvider());
  const [supply, setSupply] = useState('');
  const [account, setAccount] = useState('');
  const [mintingLimitReached, setMintingLimitReached] = useState(false);
  const [walletOrMintBtnDisabled, setWalletOrMintBtnDisabled] = useState(false);

  const contract = new ethers.Contract(contractAddress, MyNFT.abi, providerOrSigner);

  window.ethereum.on('accountsChanged', function (accounts) {
    if (accounts.length === 0) {
      setAccount('');
    }
    else if (accounts[0] !== account) {
      setAccount(accounts[0]);
    }
    setMintingLimitReached(false);
    setWalletOrMintBtnDisabled(false);
  });

  const getSupply = async () => {
    try {
      let supply = await contract.totalSupply();
      setSupply(parseInt(supply).toString());
    } catch (e) {
      console.error(e);
    }
  };

  const requestAccount = async () => {
    if (walletOrMintBtnDisabled) {
      return;
    }
    setWalletOrMintBtnDisabled(true);

    const metaMaskProvider = await detectEthereumProvider({mustBeMetaMask: true});
    if (metaMaskProvider) {
      try {
        let newProvider = new ethers.providers.Web3Provider(window.ethereum);
        let newSigner = newProvider.getSigner();
        setProviderOrSigner(newSigner);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);
      }
      finally {
        setWalletOrMintBtnDisabled(false);
      }
    }
    else {
      console.error('Please install MetaMask!');
    }
  };

  const mintPublic = async () => {
    if (walletOrMintBtnDisabled) {
      return;
    }
    setWalletOrMintBtnDisabled(true);

    try {
      await contract.mintPublic();
      const newSupply = parseInt(supply)+1;
      setSupply(newSupply.toString());
    }
    catch (error) {
      if (error.code === -32603) {
        const message = error.data.message;
        if (message.includes(revertMessages.AddressReachedPublicMintingLimit)) {
          // user has reached their minting limit
          setWalletOrMintBtnDisabled(true);
          setMintingLimitReached(true);
          return;
        }
      }
    }
    setWalletOrMintBtnDisabled(false);
  };

  if (supply === '') {
    getSupply();
  }

  let walletOrMintBtn;
  if (account !== '') {
    walletOrMintBtn = <button
      disabled={walletOrMintBtnDisabled}
      onClick={mintPublic}>
        MINT
      </button>;
  }
  else {
    walletOrMintBtn = <button
      disabled={walletOrMintBtnDisabled}
      onClick={requestAccount}>
        CONNECT WALLET
      </button>;
  }

  const mintingLimitMsg = mintingLimitReached ?
    <p>"You have reached your minting limit!"</p> :
    "";

  return (
    <div className="App">
      <h1>NFT</h1>
      <h2>PROJECT</h2>
      {walletOrMintBtn}
      <p>Minted: {supply}/50</p>
      {mintingLimitMsg}
      <div>description</div>
      <div><a href="">View on Explorer</a></div>
    </div>
  );



  // const getProvider = async () => {
  //   let provider = await detectEthereumProvider();
  //   if (provider) {
  //     console.log('Ethereum successfully detected!');
  //     console.log('metamask provider: ', provider);

  //     // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  //     // const account = accounts[0];

  //     const contract = new ethers.Contract(contractAddress, MyNFT.abi, provider);

  //     setProvider(provider);
  //   }
  //   else {
  //     console.error('Please install Metamask!', error);
  //     provider = new ethers.providers.JsonRpcProvider();
  //     const contract = new ethers.Contract(contractAddress, MyNFT.abi, provider);

  //     setProvider(provider);
  //   }
  // }

  // const requestAccount = async () => {
  //   try {
  //     await window.ethereum.request({ method: 'eth_requestAccounts' });
  //     setWalletConnected(true);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  // const getMinted = async () => {
  //   if (typeof window.ethereum !== 'undefined') {
  //     const supply = await contract.totalSupply();
  //     setMinted(supply.toString());
  //   }
  // }

  // // if (account === '') {
  // //   requestAccount();
  // // }

  // if (provider === '') {
  //   getProvider();
  // }
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





  // const a = async () => {
  //   const provider = await detectEthereumProvider()

  //   if (provider) {

  //     console.log('Ethereum successfully detected!')
  //     console.log('provider: ', provider);
  //     console.log('window.ethereum: ', window.ethereum);
  //     console.log('should be true: ', provider === window.ethereum);
  
  //     // From now on, this should always be true:
  //     // provider === window.ethereum
  
  //     // Access the decentralized web!
  //   } else {
  
  //   // if the provider is not detected, detectEthereumProvider resolves to null
  //   console.error('Please install MetaMask!')
  //   }
  // }

  // a();

  // return (<p>Hi</p>);