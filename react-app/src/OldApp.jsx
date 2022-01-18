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

const isMetaMaskInstalled = () => {
  return Boolean(window.ethereum && window.ethereum.isMetaMask)
}

function App() {
  const [providerOrSigner, setProviderOrSigner] = useState(new ethers.providers.JsonRpcProvider());
  const [supply, setSupply] = useState('');
  const [account, setAccount] = useState('');
  const [mintingLimitReached, setMintingLimitReached] = useState(false);
  const [walletOrMintBtnDisabled, setWalletOrMintBtnDisabled] = useState(false);

  useEffect(() => {
    if (isMetaMaskInstalled()) {
      function handleAccountsChanged(accounts) {
        if (accounts.length === 0 && account !== '') {
          setAccount('');
        }
        else if (accounts[0] !== account) {
          setAccount(accounts[0]);
        }
        setMintingLimitReached(false);
        setWalletOrMintBtnDisabled(false);
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  });

  const contract = new ethers.Contract(contractAddress, MyNFT.abi, providerOrSigner);

  const setNewSigner = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    setProviderOrSigner(signer);
  }

  const initialize = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setNewSigner();
      }
    } catch (err) {
      console.error('Error on init when getting accounts', err)
    }
  }

  const getSupply = async () => {
    try {
      let supply = await contract.totalSupply();
      setSupply(parseInt(supply).toString());
    } catch (e) {
      console.error(e);
    }
  };

  const handleWalletConnect = async () => {
    if (walletOrMintBtnDisabled) {
      return;
    }
    setWalletOrMintBtnDisabled(true);

    try {
      setNewSigner();
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAccount(account);
    }
    finally {
      setWalletOrMintBtnDisabled(false);
    }
  };

  const handleMintPublic = async () => {
    if (walletOrMintBtnDisabled) {
      return;
    }
    setWalletOrMintBtnDisabled(true);

    try {
      await contract.mintPublic();
      const newSupply = parseInt(supply)+1;
      setSupply(newSupply.toString());
    } catch (error) {
      if (error.code === -32603) {
        let message;
        if (error.hasOwnProperty('data')) {
          message = error.data.message;
        } 
        else {
          message = error.message;
        }
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

  // TODO: do something more than console.log
  const handleMetaMaskNotInstalled = () => {
    console.log('Please install Metamask, then refresh this page!');
  }

  if (isMetaMaskInstalled() && account === '') {
    initialize();
  }

  if (supply === '') {
    getSupply();
  }

  let walletOrMintBtn;
  if (!isMetaMaskInstalled()) {
    walletOrMintBtn = 
      <button
        onClick={handleMetaMaskNotInstalled}>
          CONNECT WALLET
      </button>;
  }
  else if (account !== '') {
    walletOrMintBtn = 
      <button
        disabled={walletOrMintBtnDisabled}
        onClick={handleMintPublic}>
          MINT
      </button>;
  }
  else {
    walletOrMintBtn = 
      <button
        disabled={walletOrMintBtnDisabled}
        onClick={handleWalletConnect}>
          CONNECT WALLET
      </button>;
  }

  const mintingLimitMsg = mintingLimitReached ?
    <p>"You have reached your minting limit!"</p> :
    "";

  return (
    <div className="App">
      {account}
      <h1>NFT</h1>
      <h2>PROJECT</h2>
      {walletOrMintBtn}
      <p>Minted: {supply}/50</p>
      {mintingLimitMsg}
      <div>description</div>
      <div><a href="">View on Explorer</a></div>
    </div>
  );
}
  
export default App;