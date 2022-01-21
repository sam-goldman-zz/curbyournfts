import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import MyNFT from './artifacts/contracts/MyNFT.sol/MyNFT.json';

import TokenSupply from "./TokenSupply.jsx";
import UserAccount from "./UserAccount.jsx";
import Network from "./Network.jsx";
import Button from "./Button.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import Description from './Description';

// TODO: change
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// TODO: change correctChainId when you switch from localhost
const correctChainId = '0x539';

// Error messages returned by the smart contract
const revertMessages = {
  AddressReachedPublicMintingLimit: "this address has reached its minting limit",
  MaxNumberPublicTokensMinted: "maximum number of public tokens have been minted",
  PublicTokensExceedsTmpMax: "there are currently no more public tokens to mint",
};

// Returns true if user has MetaMask installed on their browser
const isMetaMaskInstalled = Boolean(window.ethereum && window.ethereum.isMetaMask);

const App = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [supply, setSupply] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
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
    // In most cases, the page detects the provider after the effect is initially called.
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
          setErrorMessage(null);
          setAccount(null);
          setIsBtnDisabled(false);
        }
        else if (isCorrectChainId === false) {
          setErrorMessage('Please connect to the correct network!');
        }
        else {
          const account = accounts[0];
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);
          setAccount(account);
          setErrorMessage(null);
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
      setErrorMessage('You are disconnected from the network! Please cancel the network request in MetaMask.');
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
      setErrorMessage('Please install MetaMask, then refresh this page!');
    }
    else {
      try {
        // If this connection request is successful, then handleAccountsChanged is automatically called.
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (accounts > 0 && isCorrectChainId === false) {
          setErrorMessage('Please connect to the correct network!');
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
          setErrorMessage('You have reached your minting limit!');
        }
        else if (message.includes(revertMessages.PublicTokensExceedsTmpMax)) {
          setErrorMessage('There are currently no more NFTs to mint. Check back later!');
        }
        else if (message.includes(revertMessages.MaxNumberPublicTokensMinted)) {
          setErrorMessage('There are no more NFTs to mint. Sorry!');
        }
      }
    }
    setIsBtnDisabled(false);
  };

  // The correct chain ID is 0x539 for Localhost and 0x4 for Rinkeby
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
    contract = new ethers.Contract(contractAddress, MyNFT.abi, signer);
  }

  let network, isMintBtn;
  if (isMetaMaskInstalled && isCorrectChainId && account) {
    network = 'Localhost 8545'; // TODO: change later
    isMintBtn = true;
  }

  return (
    <div>
      {/* <Header ?/> */}

      {/* <div className="flex items-center justify-end space-x-4 mr-4 mt-4">
          {network && <Network network={network} />}
          {account && <UserAccount account={account} />}
      </div> */}


      <h1 className="text-5xl text-center font-light mt-32">NFT PROJECT</h1>

      <div className="flex flex-col items-center">
        <Button
          disabled={isBtnDisabled || errorMessage}
          onClick={isMintBtn ? () => handleMintBtnClick() : () => handleWalletBtnClick()}
          name={isMintBtn ? 'MINT' : 'CONNECT WALLET'}
        />
        <ErrorMessage message={errorMessage}/>
        <TokenSupply supply={supply} setSupply={setSupply} />
        <Description />

        <div className="flex items-center justify-end space-x-4 mr-4 mt-4">
           <a href="" className="absolute bottom-0 border border-inherit bg-white rounded-xl">OpenSea</a>
           <a href="">Contract</a>
        </div>
      </div>
    </div>
  );
}

export default App;