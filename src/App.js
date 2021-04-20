import React, { useState } from 'react'

import JSZip from 'jszip'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'
import { toBuffer, bufferToHex } from 'ethereumjs-util'
import { saveAs } from 'file-saver'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Container from '@material-ui/core/Container'

import CloudUploadIcon from '@material-ui/icons/CloudUpload'

import { signMessage } from './utils/eth'
import {
  encryptWithPubkey,
  decryptWithPrivkey,
  importSymmetricKey,
  generateSymmetricKey,
  encryptWithSymmetricKey,
  decryptWithSymmetricKey,
  compareArrayBuffers
} from './utils/crypto'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    textAlign: 'center',
    maxWidth: 1300,
    marginLeft: 'auto',
    marginRight: 'auto'
  },

  error: {
    color: 'red'
  },
  linkInput: {
    width: '100%'
  },
  uploadHolder: {
    backgroundColor: '#fafafa',
    borderRadius: theme.shape.borderRadius,
    margin: 16,
    height: '100%'
  },
  fullHeight: {
    height: '100%'
  },
  stretchHeight: {
    alignSelf: 'stretch'
  }
}))

function App () {
  const classes = useStyles()

  const handleConnectWallet = async () => {
    const signedMessage = await signMessage({ body: 'I am creating an account to mint a LIT' })
    console.log('Signed message: ' + signedMessage)

    // derive keypair
    const data = toBuffer(signedMessage)
    const hash = await crypto.subtle.digest('SHA-256', data)
    const uint8Hash = new Uint8Array(hash)
    const { publicKey, secretKey } = nacl.box.keyPair.fromSecretKey(uint8Hash)
    const keypair = {
      publicKey: naclUtil.encodeBase64(publicKey),
      secretKey: naclUtil.encodeBase64(secretKey)
    }
    console.log(keypair)
    const asString = JSON.stringify(keypair)
    localStorage.setItem('keypair', asString)
  }

  const handleSubmit = () => {

  }

  const handleMediaChosen = async (e) => {
    console.log('handleMediaChosen')

    if (!e.target.files[0]) {
      console.log('no media chosen')
      return
    }
    const files = e.target.files
    // let's zip em
    const zip = new JSZip()
    for (let i = 0; i < files.length; i++) {
      zip.folder('encryptedAssets').file(files[i].name, files[i])
    }

    // to save the zip for testing:
    // zip.generateAsync({ type: 'base64' }).then(function (base64) { // 1) generate the zip file
    // /* global saveAs */
    //   window.location = 'data:application/zip;base64,' + base64
    // }, function (err) {
    // })

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const zipBlobArrayBuffer = await zipBlob.arrayBuffer()
    console.log('blob', zipBlob)

    const symmKey = await generateSymmetricKey()
    const encryptedZipBlob = await encryptWithSymmetricKey(
      symmKey,
      zipBlobArrayBuffer
    )
    const exportedSymmKey = await crypto.subtle.exportKey('jwk', symmKey)
    console.log('exportedSymmKey', exportedSymmKey)

    // encrypt the symmetric key with the
    // public key derived from the eth wallet
    let keypair = localStorage.getItem('keypair')
    if (!keypair) {
      await handleConnectWallet()
      keypair = localStorage.getItem('keypair')
    }
    console.log('Got keypair out of localstorage: ' + keypair)
    keypair = JSON.parse(keypair)
    const pubkey = keypair.publicKey
    const privkey = keypair.secretKey

    // encrypt symm key
    const encryptedSymmKeyData = encryptWithPubkey(pubkey, JSON.stringify(exportedSymmKey), 'x25519-xsalsa20-poly1305')
    // test packing / unpacking
    const packed = JSON.stringify(encryptedSymmKeyData)

    const unpacked = JSON.parse(packed)
    // test decrypt
    const decryptedSymmKey = decryptWithPrivkey(unpacked, privkey)
    console.log('decrypted', decryptedSymmKey)

    // import the decrypted symm key
    const importedSymmKey = await importSymmetricKey(decryptedSymmKey)

    const decryptedZipArrayBuffer = await decryptWithSymmetricKey(
      encryptedZipBlob,
      importedSymmKey
    )

    // compare zip before and after as a sanity check
    const isEqual = compareArrayBuffers(
      zipBlobArrayBuffer,
      decryptedZipArrayBuffer
    )
    console.log('Zip before and after decryption are equal: ', isEqual)

    // const decryptedBlob = new Blob(
    //   [decryptedZip],
    //   { type: 'application/zip' }
    // )
    // console.log('decrypted blob', decryptedBlob)

    // saveAs(decryptedBlob, 'azip.zip')
    // console.log('saved')
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Grid
          container
          justify='space-between'
        >
          <Grid item>
            <Typography variant='h6'>
              LIT Minter
            </Typography>
          </Grid>
          <Grid item>
            <Button onClick={handleConnectWallet}>
              Connect Wallet
            </Button>
          </Grid>
        </Grid>
      </div>
      <div style={{ height: 24 }} />
      <Container maxWidth='lg'>
        <Card>
          <CardContent>
            <Grid
              container
              spacing={3}
              justify='space-between'
              alignItems='center'
            >
              <Grid item xs={12} sm={6} className={classes.stretchHeight}>
                <div className={classes.uploadHolder}>
                  <Grid
                    container
                    direction='column'
                    alignItems='center'
                    justify='center'
                    spacing={2}
                    className={classes.fullHeight}
                  >
                    <Grid item>
                      <CloudUploadIcon fontSize='large' />
                    </Grid>

                    <Grid item>
                      <Typography variant='body1' className={classes.bold}>
                        Upload your files here
                      </Typography>

                    </Grid>
                    <Grid item>
                      <label htmlFor='file-upload-nft'>
                        <Button variant='outlined' component='span'>
                          CLICK TO UPLOAD
                        </Button>
                      </label>
                      <input
                        type='file'
                        id='file-upload-nft'
                        style={{ display: 'none' }}
                        accept='video/*,audio/*,image/*'
                        onClick={e => e.target.value = ''}
                        onChange={handleMediaChosen}
                        multiple
                      />

                    </Grid>
                  </Grid>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Title'
                  fullWidth
                  placeholder='My wonderful cat'
                />
                <div style={{ height: 8 }} />
                <TextField
                  label='Description'
                  fullWidth
                  multiline
                />
                <div style={{ height: 8 }} />
                <TextField
                  type='number'
                  label='Quantity'
                  fullWidth
                />
                <div style={{ height: 8 }} />
                <TextField
                  label='Social Media URL'
                  helperText='optional'
                  fullWidth
                />
                <div style={{ height: 8 }} />
                <Button
                  onClick={handleSubmit}
                  variant='outlined'
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

    </div>
  )
}

export default App
