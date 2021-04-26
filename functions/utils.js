const { normalize } = require('eth-sig-util')

exports.getTokenMetadata = async ({ db, chain, tokenAddress, tokenId }) => {
  const normalizedTokenAddress = normalize(tokenAddress)
  const docRef = db.collection('tokens').doc(chain).collection(normalizedTokenAddress).doc(tokenId)
  const data = (await docRef.get()).data()
  return {
    name: data.title,
    description: data.description,
    external_url: data.fileUrl
  }
}

/*
{
  "description": "Friendly OpenSea Creature that enjoys long swims in the ocean.",
  "external_url": "https://openseacreatures.io/3",
  "image": "https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png",
  "name": "Dave Starbelly",
  "attributes": [ ... ],
}
*/
