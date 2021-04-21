const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { recoverPersonalSignature, normalize } = require('eth-sig-util')
const { bugsnagWrapper } = require('./bugsnag.js')

admin.initializeApp()

const db = admin.firestore()

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
