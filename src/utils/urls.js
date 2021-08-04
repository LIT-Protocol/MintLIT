import LitJsSdk from 'lit-js-sdk'

export function openseaUrl({
  chain,
  tokenId
}) {
  const tokenAddress = LitJsSdk.LIT_CHAINS[chain].contractAddress
  if (chain === 'polygon') {
    return `https://opensea.io/assets/matic/${tokenAddress}/${tokenId}`
  } else if (chain === 'ethereum') {
    return `https://opensea.io/assets/${tokenAddress}/${tokenId}`
  }
  return false
}

export function transactionUrl({
  chain,
  tokenId,
  txHash
}) {
  const tokenAddress = LitJsSdk.LIT_CHAINS[chain].contractAddress
  if (chain === 'polygon') {
    return `https://explorer-mainnet.maticvigil.com/tx/${txHash}/internal-transactions`
  } else if (chain === 'ethereum') {
    return `https://etherscan.io/tx/${txHash}`
  } else if (chain === 'xdai') {
    return `https://blockscout.com/xdai/mainnet/tx/${txHash}`
  } else if (chain === 'fantom') {
    return `https://ftmscan.com/tx/${txHash}`
  }
  return false
}
