import { ethers } from 'ethers';
import { useEffect } from 'react';
import Token from './artifacts/contracts/CurbYourNFT.sol/CurbYourNFT.json';

const contractAddress = '0x4a3844F8B63ffb024aE7b5d3BD613f8AD7bcB43b';

const TokenSupply = ({supply, setSupply}) => {
  // This effect creates an initial connection to the blockchain to get `totalSupply`.
  // Will return a value whether or not the user has MetaMask installed.
  useEffect(() => {
    const getSupply = async () => {
      const provider = new ethers.providers.AlchemyProvider(4);
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