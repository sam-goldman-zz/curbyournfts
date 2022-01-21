import { ethers } from 'ethers';
import { useEffect } from 'react';
import MyNFT from './artifacts/contracts/MyNFT.sol/MyNFT.json';

// TODO: change
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const TokenSupply = ({supply, setSupply}) => {
  // This effect creates an initial connection to the blockchain to get `totalSupply`.
  // Will return a value whether or not the user has MetaMask installed.
  useEffect(() => {
    const getSupply = async () => {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(contractAddress, MyNFT.abi, provider);

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
      className="mt-2">
        Minted: {supply}/4
    </div>
  );
}

export default TokenSupply;