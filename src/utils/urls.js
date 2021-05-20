import LitJsSdk from 'lit-js-sdk'

export function openseaUrl ({
  chain,
  tokenId
}) {
  const tokenAddress = LitJsSdk.LIT_CHAINS[chain].contractAddress
  if (chain === 'polygon') {
    return `https://opensea.io/assets/matic/${tokenAddress}/${tokenId}`
  }
}

export function transactionUrl ({
  chain,
  tokenId,
  txHash
}) {
  const tokenAddress = LitJsSdk.LIT_CHAINS[chain].contractAddress
  if (chain === 'polygon') {
    return `https://explorer-mainnet.maticvigil.com/tx/${txHash}/internal-transactions`
  }
}