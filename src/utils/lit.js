import React from 'react'

import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import ReactDOMServer from 'react-dom/server'
import { ServerStyleSheets } from '@material-ui/core/styles'

import Presentation from '../components/Presentation'

import {
  encryptWithPubkey,
  decryptWithPrivkey,
  importSymmetricKey,
  generateSymmetricKey,
  encryptWithSymmetricKey,
  decryptWithSymmetricKey,
  compareArrayBuffers
} from './crypto'

import { checkAndDeriveKeypair } from './eth'

export async function zipAndEncryptString (string) {
  const zip = new JSZip()
  zip.file('index.html', string)
  return encryptZip(zip)
}

export async function zipAndEncryptFiles (files) {
  // let's zip em
  const zip = new JSZip()
  for (let i = 0; i < files.length; i++) {
    zip.folder('encryptedAssets').file(files[i].name, files[i])
  }
  return encryptZip(zip)
}

export async function encryptZip (zip) {
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const zipBlobArrayBuffer = await zipBlob.arrayBuffer()
  console.log('blob', zipBlob)

  const symmKey = await generateSymmetricKey()
  const encryptedZipBlob = await encryptWithSymmetricKey(
    symmKey,
    zipBlobArrayBuffer
  )

  // to download the encrypted zip file for testing, uncomment this
  // saveAs(encryptedZipBlob, 'encrypted.bin')

  const exportedSymmKey = await crypto.subtle.exportKey('jwk', symmKey)
  console.log('exportedSymmKey', exportedSymmKey)

  // encrypt the symmetric key with the
  // public key derived from the eth wallet
  const keypair = await checkAndDeriveKeypair()
  const pubkey = keypair.publicKey
  const privkey = keypair.secretKey

  // encrypt symm key
  const encryptedSymmKeyData = encryptWithPubkey(pubkey, JSON.stringify(exportedSymmKey), 'x25519-xsalsa20-poly1305')
  const packed = JSON.stringify(encryptedSymmKeyData)

  //   console.log('packed symmetric key ', packed)
  //   const unpacked = JSON.parse(packed)
  //   // test decrypt
  //   const decryptedSymmKey = decryptWithPrivkey(unpacked, privkey)
  //   console.log('decrypted', decryptedSymmKey)
  //
  //   // import the decrypted symm key
  //   const importedSymmKey = await importSymmetricKey(decryptedSymmKey)
  //
  //   const decryptedZipArrayBuffer = await decryptWithSymmetricKey(
  //     encryptedZipBlob,
  //     importedSymmKey
  //   )
  //
  //   // compare zip before and after as a sanity check
  //   const isEqual = compareArrayBuffers(
  //     zipBlobArrayBuffer,
  //     decryptedZipArrayBuffer
  //   )
  //   console.log('Zip before and after decryption are equal: ', isEqual)
  //   if (!isEqual) {
  //     throw new Error('Decrypted zip does not match original zip.  Something is wrong.')
  //   }

  // to download the zip, for testing, uncomment this
  //   const decryptedBlob = new Blob(
  //     [decryptedZipArrayBuffer],
  //     { type: 'application/zip' }
  //   )
  //   console.log('decrypted blob', decryptedBlob)
  //
  //   saveAs(decryptedBlob, 'decrypted.zip')
  // console.log('saved')

  return {
    encryptedSymmetricKey: packed,
    encryptedZip: encryptedZipBlob
  }
}

export function createHtmlWrapper (props) {
  const { title } = props
  const sheets = new ServerStyleSheets()

  const html = ReactDOMServer.renderToString(sheets.collect(
    <Presentation {...props} />
  ))
  const css = sheets.toString()

  return `
<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <style id="jss-server-side">${css}</style>
  </head>
  <body>
    <div id="root">${html}</div>
  </body>
</html>
  `
}
