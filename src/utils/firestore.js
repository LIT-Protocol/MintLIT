import LitJsSdk from 'lit-js-sdk'

import firebase from './firebase'

const db = firebase.firestore()

export const getMetadata = async ({ tokenIds, chain }) => {
  const tokenAddress = LitJsSdk.LIT_CHAINS[chain].contractAddress.toLowerCase()
  return (await Promise.all(tokenIds.map(async tokenId => {
    // console.log(`looking for ${tokenId} on chain ${chain} for token contractAddress ${tokenAddress}`)
    const tokens = db.collection('tokens')
    const chainDoc = tokens.doc(chain)
    const tokenCollection = chainDoc.collection(tokenAddress)
    const docRef = tokenCollection.doc(tokenId.toString())
    const doc = await docRef.get()
    if (doc.exists) {
      return doc.data()
    }
    return null
  }))).filter(d => d !== null)
}
