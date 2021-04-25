const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { recoverPersonalSignature, normalize } = require('eth-sig-util')
const { bugsnagWrapper } = require('./bugsnag.js')
const uuid = require('uuid-v4')

admin.initializeApp()

const db = admin.firestore()
const bucket = admin.storage().bucket()
const storage = admin.storage()

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
    filePath,
    encryptedSymmetricKey,
    fileId,
    txHash
  } = data
  functions.logger.info('saveTokenMetadata')
  const normalizedTokenAddress = normalize(tokenAddress)

  const file = bucket.file(filePath)
  await file.makePublic()
  const fileUrl = file.publicUrl()

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
    fileId,
    txHash
  })

  docRef.collection('encryptedSymmetricKeys').doc(mintingAddress).create({
    encryptedSymmetricKey,
    address: normalize(mintingAddress)
  })

  return { success: true }
}))
