const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { recoverPersonalSignature, normalize } = require('eth-sig-util')
const { bugsnagWrapper } = require('./bugsnag.js')
const { getTokenMetadata } = require('./utils.js')
const uuid = require('uuid-v4')

admin.initializeApp()

const db = admin.firestore()
const bucket = admin.storage().bucket()
const storage = admin.storage()

const LIT_CHAINS = {
  polygon: {
    contractAddress: '0x7C7757a9675f06F3BE4618bB68732c4aB25D2e88',
    chainId: 137
  },
  fantom: {
    contractAddress: '0x5bD3Fe8Ab542f0AaBF7552FAAf376Fd8Aa9b3869',
    chainId: 250
  },
  ethereum: {
    contractAddress: '0xA54F7579fFb3F98bd8649fF02813F575f9b3d353',
    chainId: 1
  },
  xdai: {
    contractAddress: '0xDFc2Fd83dFfD0Dafb216F412aB3B18f2777406aF',
    chainId: 100
  }
}

exports.savePublicKey = functions.https.onCall(bugsnagWrapper(async (data, context) => {
  const { sig, msg, pubkey } = data
  functions.logger.info(`savePublicKey with sig ${sig} and message ${msg}`)

  // verify the sig
  const userAddress = recoverPersonalSignature({
    data: msg,
    sig: sig
  })
  const address = normalize(userAddress)
  functions.logger.info(`Recovered address ${address}`)

  const res = await db.collection('users').doc(address).set({
    pubkey
  })
  return { success: true }
}))

exports.getPublicKey = functions.https.onCall(bugsnagWrapper(async (data, context) => {
  const { address } = data
  functions.logger.info(`get public key for address ${address}`)

  const userRef = db.collection('users').doc(normalize(address))
  const doc = await userRef.get()
  if (!doc.exists) {
    console.log('No such document!')
    return {
      error: 'There was no public key found for this user',
      errorCode: 'not_found'
    }
  } else {
    console.log('Document data:', doc.data())
    return {
      pubkey: doc.data().pubkey
    }
  }
}))

exports.getUploadUrl = functions.https.onCall(bugsnagWrapper(async (data, context) => {
  const urlOptions = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 1000 * 60 * 60 * 24 // 24 hours,
    // extensionHeaders: {
    //   'x-goog-content-length-range': '0,25000000' // 25mb max
    // },
    // virtualHostedStyle: true
  }

  const fileId = uuid()
  const filePath = `litUploads/${fileId}`

  const file = bucket
    .file(filePath)
  const [uploadUrl] = await file
    .getSignedUrl(urlOptions)

  return { uploadUrl, filePath, fileId }
}))

exports.createTokenMetadata = functions.https.onCall(bugsnagWrapper(async (data, context) => {
  const {
    chain,
    tokenAddress,
    tokenId,
    title,
    description,
    socialMediaUrl,
    quantity,
    mintingAddress,
    fileUrl,
    ipfsCid,
    txHash
  } = data
  functions.logger.info('saveTokenMetadata')
  const normalizedTokenAddress = normalize(tokenAddress)

  // save the metadata
  const docRef = db.collection('tokens').doc(chain).collection(normalizedTokenAddress).doc(tokenId)
  docRef.create({
    chain,
    tokenAddress: normalizedTokenAddress,
    tokenId,
    title,
    description,
    socialMediaUrl,
    quantity,
    mintingAddress,
    fileUrl,
    ipfsCid,
    txHash
  })

  return { success: true }
}))

exports.getPolygonTokenMetadata = functions.https.onRequest(bugsnagWrapper(async (req, res) => {
  const pathParts = req.path.split('/')
  const tokenId = pathParts[pathParts.length - 1]

  const chain = 'polygon'
  const tokenAddress = normalize(LIT_CHAINS[chain].contractAddress)
  console.log(`getting token metadata for chain ${chain} and tokenAddress ${tokenAddress} and tokenId ${tokenId}`)
  const metadata = await getTokenMetadata({
    db,
    chain,
    tokenAddress,
    tokenId
  })
  res.json(metadata)
}))

exports.getEthereumTokenMetadata = functions.https.onRequest(bugsnagWrapper(async (req, res) => {
  const pathParts = req.path.split('/')
  const tokenId = pathParts[pathParts.length - 1]

  const chain = 'ethereum'
  const tokenAddress = normalize(LIT_CHAINS[chain].contractAddress)
  console.log(`getting token metadata for chain ${chain} and tokenAddress ${tokenAddress} and tokenId ${tokenId}`)
  const metadata = await getTokenMetadata({
    db,
    chain,
    tokenAddress,
    tokenId
  })
  res.json(metadata)
}))

exports.getFantomTokenMetadata = functions.https.onRequest(bugsnagWrapper(async (req, res) => {
  const pathParts = req.path.split('/')
  const tokenId = pathParts[pathParts.length - 1]

  const chain = 'fantom'
  const tokenAddress = normalize(LIT_CHAINS[chain].contractAddress)
  console.log(`getting token metadata for chain ${chain} and tokenAddress ${tokenAddress} and tokenId ${tokenId}`)
  const metadata = await getTokenMetadata({
    db,
    chain,
    tokenAddress,
    tokenId
  })
  res.json(metadata)
}))

exports.getXdaiTokenMetadata = functions.https.onRequest(bugsnagWrapper(async (req, res) => {
  const pathParts = req.path.split('/')
  const tokenId = pathParts[pathParts.length - 1]

  const chain = 'xdai'
  const tokenAddress = normalize(LIT_CHAINS[chain].contractAddress)
  console.log(`getting token metadata for chain ${chain} and tokenAddress ${tokenAddress} and tokenId ${tokenId}`)
  const metadata = await getTokenMetadata({
    db,
    chain,
    tokenAddress,
    tokenId
  })
  res.json(metadata)
}))


exports.getContractMetadata = functions.https.onRequest(bugsnagWrapper(async (req, res) => {
  const metadata = {
    "name": "Lit Protocol",
    "description": "Lit is a next-generation access control protocol.  Lit enabled NFTs are HTML NFTs with super powers like exclusive content for token holders",
    "image": "https://mintlit.com/apple-touch-icon.png",
    "external_link": "https://litprotocol.com"
  }
  res.json(metadata)
}))