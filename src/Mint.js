import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Container from '@material-ui/core/Container'
import IconButton from '@material-ui/core/IconButton'
import Link from '@material-ui/core/Link'
import CircularProgress from '@material-ui/core/CircularProgress'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Tooltip from '@material-ui/core/Tooltip'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import DeleteIcon from '@material-ui/icons/Delete'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import LockIcon from '@material-ui/icons/Lock'
import LandscapeIcon from '@material-ui/icons/Landscape'
import LandscapeOutlinedIcon from '@material-ui/icons/LandscapeOutlined'

import LitJsSdk from 'lit-js-sdk'
import Presentation from './components/Presentation'
import { getUploadUrl, createTokenMetadata } from './utils/cloudFunctions'
import { fileToDataUrl } from './utils/browser'
import {
  createHtmlWrapper,
  createMediaGridHtmlString

} from './utils/lit'
import {

  openseaUrl,
  transactionUrl

} from './utils/urls'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    textAlign: 'center',
    maxWidth: 1300,
    marginLeft: 'auto',
    marginRight: 'auto'
  },

  error: {
    color: 'red',
    fontSize: 16
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
  },
  selectDropdown: {
    width: '100%',
    textAlign: 'left'
  }
}))

export default function Mint () {
  const classes = useStyles()
  const [includedFiles, setIncludedFiles] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [socialMediaUrl, setSocialMediaUrl] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [filePath, setFilePath] = useState('')
  const [fileId, setFileId] = useState('')
  const [chain, setChain] = useState('polygon')
  const [error, setError] = useState('')
  const [minting, setMinting] = useState(false)
  const [mintingComplete, setMintingComplete] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [tokenId, setTokenId] = useState(null)

  const getPresignedUploadUrl = () => {
    getUploadUrl()
      .then(data => {
        setUploadUrl(data.uploadUrl)
        setFileId(data.fileId)
        setFilePath(data.filePath)
      })
  }

  useEffect(() => {
    // get presigned upload url
    getPresignedUploadUrl()
  }, [])

  const handleConnectWallet = async () => {
    await LitJsSdk.checkAndDeriveKeypair()
  }

  const handleSubmit = async () => {
    setMinting(true)
    setMintingComplete(false)
    setError('')

    console.log('encrypting locked files')
    const lockedFiles = includedFiles.filter(f => !f.backgroundImage && f.encrypted)
    const lockedFileMediaGridHtml = createMediaGridHtmlString({ files: lockedFiles })
    const { encryptedSymmetricKey, encryptedZip } = await LitJsSdk.zipAndEncryptString(lockedFileMediaGridHtml)

    // package up all the stuffs
    console.log('creating html wrapper')
    const htmlString = await createHtmlWrapper({
      encryptedSymmetricKey,
      title,
      description,
      quantity,
      socialMediaUrl,
      backgroundImage,
      publicFiles: includedFiles.filter(f => !f.backgroundImage && !f.encrypted),
      lockedFiles: await fileToDataUrl(encryptedZip)
    })

    console.log('uploading html')
    const litHtmlBlob = new Blob(
      [htmlString],
      { type: 'text/html' }
    )
    // upload file while minting on chain
    const uploadPromise = fetch(uploadUrl, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/html'
      },
      body: litHtmlBlob
    })

    console.log('minting')
    const { tokenId, tokenAddress, mintingAddress, txHash, errorCode } = await LitJsSdk.mintLIT({ chain, quantity })
    setTokenId(tokenId)
    await uploadPromise

    if (errorCode) {
      if (errorCode === 'wrong_chain') {
        setError(
          <>
            <Typography variant='body1'>
              Your metamask or wallet is on the wrong blockchain.  If you are trying to mint on Polygon / Matic, follow <Link target='_blank' rel='noreferrer' href='https://medium.com/stakingbits/setting-up-metamask-for-polygon-matic-network-838058f6d844'>these instructions</Link> to add Polygon to your metamask
            </Typography>
          </>
        )
      } else if (errorCode === 'user_rejected_request') {
        setError('You rejected the request in your wallet')
      } else {
        setError('An unknown error occurred')
      }
      setMinting(false)
      return
    }

    console.log('creating token metadata on server')
    // save token metadata
    createTokenMetadata({
      chain,
      tokenAddress,
      tokenId,
      title,
      description,
      socialMediaUrl,
      quantity,
      mintingAddress,
      filePath,
      fileId,
      encryptedSymmetricKey,
      txHash
    })

    setMinting(false)
    setMintingComplete(true)
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
        encrypted: true,
        backgroundImage: false,
        dataUrl,
        originalFile: files[i]
      })
    }
    const newIncludedFiles = [...includedFiles, ...convertedFiles]

    setIncludedFiles(newIncludedFiles)
  }

  const handleRemoveFile = (i) => {
    const file = includedFiles[i]
    if (file.backgroundImage) {
      setBackgroundImage(null)
    }
    setIncludedFiles(prevFiles => {
      const tempFiles = [...prevFiles]
      tempFiles.splice(i, 1)
      return tempFiles
    })
  }

  const handleSetAsBackgroundImage = (i) => {
    const file = includedFiles[i]
    setBackgroundImage(file)
    setIncludedFiles(prevFiles => {
      let tempFiles = [...prevFiles]
      // remove all others as background image, first
      tempFiles = tempFiles.map(f => {
        f.backgroundImage = false
        return f
      })
      tempFiles[i].backgroundImage = true
      return tempFiles
    })
  }

  const handleRemoveAsBackgroundImage = (i) => {
    setBackgroundImage(null)
    setIncludedFiles(prevFiles => {
      const tempFiles = [...prevFiles]
      tempFiles[i].backgroundImage = false
      return tempFiles
    })
  }

  const handleMakePublic = (i) => {
    setIncludedFiles(prevFiles => {
      const tempFiles = [...prevFiles]
      tempFiles[i].encrypted = false
      return tempFiles
    })
  }

  const handleMakePrivate = (i) => {
    setIncludedFiles(prevFiles => {
      const tempFiles = [...prevFiles]
      tempFiles[i].encrypted = true
      return tempFiles
    })
  }

  const handleMintAnother = () => {
    setMintingComplete(false)
    setMinting(false)
    setError('')
    setIncludedFiles([])
    setTitle('')
    setDescription('')
    setQuantity(1)
    setSocialMediaUrl('')
    setUploadUrl('')
    setFilePath('')
    setFileId('')
    setBackgroundImage(null)
    setTokenId(null)
    getPresignedUploadUrl()
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
                        Images, videos, and audio files accepted.  25mb max total.
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

                            {file.type.includes('image')
                              ? (
                                  file.backgroundImage
                                    ? (
                                      <Tooltip title='Remove as background image'>
                                        <IconButton
                                          size='small'
                                          onClick={() => handleRemoveAsBackgroundImage(i)}
                                        >
                                          <LandscapeOutlinedIcon />
                                        </IconButton>
                                      </Tooltip>
                                      )
                                    : (
                                      <Tooltip title='Make background image'>
                                        <IconButton
                                          size='small'
                                          onClick={() => handleSetAsBackgroundImage(i)}
                                        >
                                          <LandscapeIcon />
                                        </IconButton>
                                      </Tooltip>
                                      )
                                )
                              : null}

                            {file.encrypted
                              ? (
                                <Tooltip title='This file is encrypted and only LIT holders will be able to view it.  Click to make public'>
                                  <IconButton
                                    size='small'
                                    onClick={() => handleMakePublic(i)}
                                  >
                                    <LockOpenIcon />
                                  </IconButton>
                                </Tooltip>
                                )
                              : (
                                <Tooltip title='This file is public.  Click to make it encrypted so only LIT holders will be able to view it'>
                                  <IconButton
                                    size='small'
                                    onClick={() => handleMakePrivate(i)}
                                  >
                                    <LockIcon />
                                  </IconButton>
                                </Tooltip>
                                )}
                            <Tooltip title='Remove file from LIT'>
                              <IconButton
                                size='small'
                                onClick={() => handleRemoveFile(i)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
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
                <div style={{ height: 16 }} />
                <TextField
                  label='Description'
                  fullWidth
                  multiline
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <div style={{ height: 16 }} />
                <TextField
                  type='number'
                  label='Quantity'
                  fullWidth
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                />
                <div style={{ height: 16 }} />
                <TextField
                  label='Social Media URL (optional)'
                  fullWidth
                  value={socialMediaUrl}
                  onChange={e => setSocialMediaUrl(e.target.value)}
                />
                <div style={{ height: 16 }} />
                <FormControl className={classes.selectDropdown}>
                  <InputLabel id='select-chain-label'>Blockchain</InputLabel>
                  <Select
                    labelId='select-chain-label'
                    value={chain}
                    onChange={e => setChain(e.target.value)}
                  >
                    <MenuItem value='polygon'>Polygon</MenuItem>
                    <MenuItem value='ethereum'>Ethereum</MenuItem>
                  </Select>
                </FormControl>
                <div style={{ height: 16 }} />
                <Button
                  onClick={handleSubmit}
                  variant='outlined'
                  disabled={minting}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error
          ? (
            <>
              <div style={{ height: 16 }} />
              <Card>
                <CardContent>
                  <div className={classes.error}>{error}</div>
                </CardContent>
              </Card>
            </>
            )
          : null}

        {minting && !mintingComplete
          ? (
            <div>
              <div style={{ height: 16 }} />
              <CircularProgress size={50} />
              <Typography variant='h6'>Minting, please wait...</Typography>
            </div>
            )
          : null}

        {
          includedFiles.length > 0 && !minting && !mintingComplete
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
                      previewMode
                      title={title}
                      description={description}
                      quantity={quantity}
                      socialMediaUrl={socialMediaUrl}
                      publicFiles={includedFiles.filter(f => !f.backgroundImage && !f.encrypted)}
                      lockedFilesForPreview={includedFiles.filter(f => !f.backgroundImage && f.encrypted)}
                      backgroundImage={backgroundImage}
                    />
                  </CardContent>
                </Card>
              </>
              )
            : null
          }

        {mintingComplete
          ? (
            <Card>
              <CardContent>
                <Typography variant='h6'>Your token has been minted</Typography>
                <Link href={transactionUrl({ chain, tokenId })}>View Transaction</Link>
                <br />
                <Link href={openseaUrl({ chain, tokenId })}>View on Opensea</Link>
                <div style={{ height: 24 }} />
                <Button
                  onClick={handleMintAnother}
                >
                  Mint Another
                </Button>
              </CardContent>
            </Card>
            )
          : null}
      </Container>

    </div>
  )
}
