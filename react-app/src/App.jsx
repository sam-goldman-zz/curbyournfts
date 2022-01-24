import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import Token from './artifacts/contracts/CurbYourNFT.sol/CurbYourNFT.json';
import TokenSupply from "./TokenSupply.jsx";
import Button from "./Button.jsx";
import UserAccount from "./UserAccount.jsx";
import larry from "./larry.jpg";

const contractAddress = '0x4a3844F8B63ffb024aE7b5d3BD613f8AD7bcB43b';
const correctChainId = '0x4';

// Error messages returned by the smart contract
const revertMessages = {
  AddressReachedPublicMintingLimit: "this address has reached its minting limit",
  MaxNumberPublicTokensMinted: "maximum number of public tokens have been minted",
  PublicTokensExceedsTmpMax: "there are currently no more public tokens to mint",
};

const isMetaMaskInstalled = Boolean(window.ethereum && window.ethereum.isMetaMask);

const App = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [supply, setSupply] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isCorrectChainId, setIsCorrectChainId] = useState(null);
  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  // Detects if the user is already connected to the network on MetaMask
  useEffect(() => {
    if (isMetaMaskInstalled && isCorrectChainId) {
      const getInitialConnection = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const account = accounts[0];
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          setAccount(account);
          setProvider(provider);
        }
      }

      getInitialConnection();
    }
  }, [isCorrectChainId]);

  // This effect runs setup code when the page detects the MetaMask provider.
  // It handles two cases:
  // 1. The page detects the provider when the effect is first called.
  // 2. The page detects the provider after the effect is first called.
  useEffect(() => {
    if (!isMetaMaskInstalled) {
      return;
    }
    
    // Case 1:
    // This code will run if the page already has access to the provider object when the effect is first called.
    // The `isConnected` method returns true when this is the case.
    if (window.ethereum.isConnected()) {
      const handleIsConnected = async () => {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        handleChainId(chainId);
      };

      handleIsConnected();
    }

    // Case 2:
    // Most of the time, the page detects the provider after the effect is initially called.
    // When this happens, the `connect` event will be emitted shortly after the effect finishes running.
    const handleConnect = (connectInfo) => {
      const chainId = connectInfo.chainId;
      handleChainId(chainId);
    }

    window.ethereum.on('connect', handleConnect);

    return () => window.ethereum.removeListener('connect', handleConnect);
  }, []);

  useEffect(() => {
    if (!isMetaMaskInstalled) {
      return;
    }

    if (isCorrectChainId !== null) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          setProvider(null);
          setAlert(null);
          setAccount(null);
          setIsBtnDisabled(false);
        }
        else if (isCorrectChainId === false) {
          setAlert('Please connect to the correct network!');
        }
        else {
          const account = accounts[0];
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);
          setAccount(account);
          setAlert(null);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  }, [isCorrectChainId]);

  useEffect(() => {
    if (!isMetaMaskInstalled) {
      return;
    }

    const handleChainChanged = () => {
      window.location.reload();
    }

    window.ethereum.on('chainChanged', handleChainChanged);

    return () => window.ethereum.removeListener('chainChanged', handleChainChanged);
  }, []);

  useEffect(() => {
    if (!isMetaMaskInstalled) {
      return;
    }

    const handleDisconnect = (error) => {
      setAlert('You are disconnected from the network! Please cancel the network request in MetaMask.');
      console.error('User disconnected from network', error);
    };

    window.ethereum.on('disconnect', handleDisconnect);

    return () => window.ethereum.removeListener('disconnect', handleDisconnect);
  }, []);

  const handleWalletBtnClick = async () => {
    if (isBtnDisabled) {
      return;
    }
    setIsBtnDisabled(true);

    if (!isMetaMaskInstalled) {
      setAlert('Please install MetaMask, then refresh this page!');
    }
    else {
      try {
        // If this connection request is successful, then handleAccountsChanged is automatically called.
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (accounts > 0 && isCorrectChainId === false) {
          setAlert('Please connect to the correct network!');
        }
      } catch (e) {
        console.error("Error when requesting user's MetaMask account", e);
      }
    }
    setIsBtnDisabled(false);
  }

  const handleMintBtnClick = async () => {
    if (isBtnDisabled) {
      return;
    }
    setIsBtnDisabled(true);

    try {
      await contract.mintPublic();
      const newSupply = parseInt(supply) + 1;
      setSupply(newSupply);
      const link = 'https://testnets.opensea.io/assets/0x4a3844f8b63ffb024ae7b5d3bd613f8ad7bcb43b/' + supply;
      const embeddedLink = <a
        href={link}
        target="_blank"
        className="underline">
          Woohoo! View your NFT here.
      </a>
      setAlert(embeddedLink);
    } catch (error) {
      if (error.code === -32603) {
        let message;
        if (error.hasOwnProperty('data') && error.data.hasOwnProperty('message')) {
          message = error.data.message;
        }
        else if (error.hasOwnProperty('message')) {
          message = error.message;
        }

        if (message.includes(revertMessages.AddressReachedPublicMintingLimit)) {
          setAlert('You have reached your minting limit!');
        }
        else if (message.includes(revertMessages.PublicTokensExceedsTmpMax)) {
          setAlert('There are currently no more NFTs to mint. Check back later!');
        }
        else if (message.includes(revertMessages.MaxNumberPublicTokensMinted)) {
          setAlert('There are no more NFTs to mint. Sorry!');
        }
      }
    }
    setIsBtnDisabled(false);
  };

  // The correct chain ID is 0x4 for Rinkeby
  const handleChainId = (chainId) => {
    if (chainId === correctChainId) {
      setIsCorrectChainId(true);
    }
    else {
      setIsCorrectChainId(false);
    }
  };

  let contract;
  if (provider) {
    const signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, Token.abi, signer);
  }

  let network, isMintBtn;
  if (isMetaMaskInstalled && isCorrectChainId && account) {
    network = 'Rinkeby Network';
    isMintBtn = true;
  }

  return (
    <div className="h-screen bg-black">
      <div className="h-12 flex justify-end px-4 pt-4">
        {network && <div className="border bg-white mr-2 rounded-xl px-2 py-1 transition hover:bg-yellow-200">{network}</div>}
        {account && <UserAccount account={account} />}
      </div>
        <div className="main flex flex-col items-center justify-between">
          <h1 className="pt-16 font-bold text-5xl text-yellow-400">Curb Your NFTs</h1>
          <img className="h-40 w-36 mt-4 rounded-xl" src={larry} alt="Larry" />
          <Button
            disabled={isBtnDisabled || alert}
            onClick={isMintBtn ? () => handleMintBtnClick() : () => handleWalletBtnClick()}
            name={isMintBtn ? 'MINT' : 'CONNECT WALLET'}
          />
          <TokenSupply supply={supply} setSupply={setSupply} />
          <div className="h-12 text-yellow-400 text-lg">{alert}</div>
          <div className="w-80 p-2 mb-20 text-center text-sm bg-white rounded-2xl border transition hover:bg-yellow-200">
            Curb Your NFTs is a project to put quotes from TV's favorite grouch, Larry David, onto the blockchain. There are 50 NFTs total, 10 of which are reserved. Each one is free to mint, except for the price of gas. Available on the Rinkeby testnet only.
          </div>
          <div className="mb-4">
            <a href="https://testnets.opensea.io/collection/curbyournft" className="border border-inherit bg-white rounded-lg px-2 py-1 mx-1 transition hover:bg-yellow-200">OpenSea</a>
            <a href="https://rinkeby.etherscan.io/address/0x4a3844F8B63ffb024aE7b5d3BD613f8AD7bcB43b" className="border border-inherit bg-white rounded-lg px-2 py-1 mx-1 transition hover:bg-yellow-200">Contract</a>
          </div>
        </div>
    </div>
  );
}

export default App;