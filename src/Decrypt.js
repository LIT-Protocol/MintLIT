import React, { useState } from 'react'
import { saveAs } from 'file-saver'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Container from '@material-ui/core/Container'
import IconButton from '@material-ui/core/IconButton'

import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import DeleteIcon from '@material-ui/icons/Delete'

import { connectWalletAndDeriveKeys } from './utils/eth'
import {
  decryptWithSymmetricKey,
  decryptWithPrivkey,
  importSymmetricKey
} from './utils/crypto'

import Presentation from './components/Presentation'

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
    backgroundColor: '#efefef',
    borderRadius: theme.shape.borderRadius,
    margin: 16,
    height: '100%'
  },
  fullHeight: {
    height: '100%'
  },
  stretchHeight: {
    alignSelf: 'stretch'
  },
  bold: {
    fontWeight: 'bold'
  },
  leftAlignText: {
    textAlign: 'left'
  }
}))

export default function Decrypt () {
  const classes = useStyles()
  const [symmKey, setSymmKey] = useState('')
  const [file, setFile] = useState(null)

  const handleConnectWallet = async () => {
    await connectWalletAndDeriveKeys()
  }

  const handleSubmit = async () => {
    let keypair = localStorage.getItem('keypair')
    if (!keypair) {
      await connectWalletAndDeriveKeys()
      keypair = localStorage.getItem('keypair')
    }
    console.log('Got keypair out of localstorage: ' + keypair)
    keypair = JSON.parse(keypair)
    const pubkey = keypair.publicKey
    const privkey = keypair.secretKey

    const unpacked = JSON.parse(symmKey)
    // test decrypt
    const decryptedSymmKey = decryptWithPrivkey(unpacked, privkey)
    console.log('decrypted', decryptedSymmKey)

    // import the decrypted symm key
    const importedSymmKey = await importSymmetricKey(decryptedSymmKey)

    const decryptedZipArrayBuffer = await decryptWithSymmetricKey(
      file,
      importedSymmKey
    )

    const decryptedBlob = new Blob(
      [decryptedZipArrayBuffer],
      { type: 'application/zip' }
    )
    console.log('decrypted blob', decryptedBlob)

    saveAs(decryptedBlob, 'decrypted.zip')
    console.log('saved')
  }

  const handleMediaChosen = async (e) => {
    console.log('handleMediaChosen')

    if (!e.target.files[0]) {
      console.log('no media chosen')
      return
    }
    setFile(e.target.files[0])
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
              LIT Decrypter
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

                      <Typography variant='body1' className={classes.bold}>
                        Upload your encrypted LIT
                      </Typography>
                      <Typography variant='body1'>
                        Only encrypted BIN accepted
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
                        accept='application/octet-stream'
                        onClick={e => e.target.value = ''}
                        onChange={handleMediaChosen}
                      />
                    </Grid>
                  </Grid>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Encrypted Symmetric Key'
                  fullWidth
                  value={symmKey}
                  onChange={e => setSymmKey(e.target.value)}
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
