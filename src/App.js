import React, { useState } from 'react'

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
import { createHtmlWrapper, zipAndEncryptString } from './utils/lit'
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

function App () {
  const classes = useStyles()
  const [includedFiles, setIncludedFiles] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [socialMediaUrl, setSocialMediaUrl] = useState('')

  const handleConnectWallet = async () => {
    await connectWalletAndDeriveKeys()
  }

  const handleSubmit = () => {
    // package up all the stuffs
    const htmlString = createHtmlWrapper({
      title,
      description,
      quantity,
      socialMediaUrl,
      files: includedFiles
    })
    const locked = zipAndEncryptString(htmlString)
  }

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
      // log to console
      // logs data:<type>;base64,wL2dvYWwgbW9yZ...
      // console.log(reader.result);
        resolve(reader.result)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleMediaChosen = async (e) => {
    console.log('handleMediaChosen')

    if (!e.target.files[0]) {
      console.log('no media chosen')
      return
    }
    const files = e.target.files
    const convertedFiles = []
    for (let i = 0; i < files.length; i++) {
      const dataUrl = await fileToDataUrl(files[i])
      convertedFiles.push({
        type: files[i].type,
        name: files[i].name,
        dataUrl
      })
    }
    const newIncludedFiles = [...includedFiles, ...convertedFiles]

    setIncludedFiles(newIncludedFiles)
  }

  const handleRemoveFile = (i) => {
    setIncludedFiles(prevFiles => {
      const tempFiles = [...prevFiles]
      tempFiles.splice(i, 1)
      return tempFiles
    })
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

                      <Typography variant='body1' className={classes.bold}>
                        Upload your files here
                      </Typography>
                      <Typography variant='body1'>
                        Images, videos, and audio files accepted
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
                    <Grid item>
                      {includedFiles.length > 0
                        ? (
                          <Typography
                            variant='body1'
                            className={classes.bold}
                          >
                            Included Files
                          </Typography>
                          )
                        : null}
                      {includedFiles.map((file, i) =>
                        <Grid
                          container
                          key={i}
                          spacing={1}
                          justify='flex-start'
                          alignItems='center'
                        >
                          <Grid item style={{ flexGrow: 1 }}>
                            <Typography
                              variant='body1'
                              className={classes.leftAlignText}
                            >
                              {file.name}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <IconButton
                              size='small'
                              onClick={() => handleRemoveFile(i)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Title'
                  fullWidth
                  placeholder='My wonderful cat'
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <div style={{ height: 8 }} />
                <TextField
                  label='Description'
                  fullWidth
                  multiline
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <div style={{ height: 8 }} />
                <TextField
                  type='number'
                  label='Quantity'
                  fullWidth
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                />
                <div style={{ height: 8 }} />
                <TextField
                  label='Social Media URL'
                  helperText='optional'
                  fullWidth
                  value={socialMediaUrl}
                  onChange={e => setSocialMediaUrl(e.target.value)}
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

        {
          includedFiles.length > 0
            ? (
              <>
                <div style={{ height: 16 }} />
                <Typography variant='h6'>
                  Preview of your LIT
                </Typography>
                <div style={{ height: 8 }} />
                <Card>
                  <CardContent>
                    <Presentation
                      title={title}
                      description={description}
                      quantity={quantity}
                      socialMediaUrl={socialMediaUrl}
                      files={includedFiles}
                    />
                  </CardContent>
                </Card>
              </>
              )
            : null
          }
      </Container>

    </div>
  )
}

export default App
