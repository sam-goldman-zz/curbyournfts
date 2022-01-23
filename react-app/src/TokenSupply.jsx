import { ethers } from 'ethers';
import { useEffect } from 'react';
import Token from './artifacts/contracts/CurbYourNFT.sol/CurbYourNFT.json';

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const TokenSupply = ({supply, setSupply}) => {
  // This effect creates an initial connection to the blockchain to get `totalSupply`.
  // Will return a value whether or not the user has MetaMask installed.
  useEffect(() => {
    const getSupply = async () => {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(contractAddress, Token.abi, provider);

      try {
        let newSupply = await contract.totalSupply();
        setSupply(parseInt(newSupply));
      } catch (e) {
        console.error('Error calling totalSupply', e);
      }
    };

    getSupply();
  }, [setSupply]);

  return (
    <div
      className="mt-2 text-yellow-400 text-lg">
        Minted: {supply}/40
    </div>
  );
}

export default TokenSupply;