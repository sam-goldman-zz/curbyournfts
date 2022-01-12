import detectEthereumProvider from '@metamask/detect-provider'

const provider = await detectEthereumProvider()

if (provider) {

  console.log('Ethereum successfully detected!')

  // From now on, this should always be true:
  // provider === window.ethereum

  // Access the decentralized web!

  // Legacy providers may only have ethereum.sendAsync
  const chainId = await provider.request({
    method: 'eth_chainId'
  })
} else {

  // if the provider is not detected, detectEthereumProvider resolves to null
  console.error('Please install MetaMask!', error)
}