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
import { NFTStorage, Blob } from 'nft.storage'

import LitJsSdk from 'lit-js-sdk'
import Presentation from './components/Presentation'
import { createTokenMetadata } from './utils/cloudFunctions'
import { fileToDataUrl } from './utils/browser'
import {
  createHtmlWrapper,
  createMediaGridHtmlString
} from './utils/lit'
import {
  openseaUrl,
  transactionUrl
} from './utils/urls'
import Header from './Header'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    textAlign: 'center',
    maxWidth: 1300,
    marginLeft: 'auto',
    marginRight: 'auto',
    height: '100%'
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

const NFT_STORAGE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDg4YzhGRGU0ODIwRWU0MEEwREZkMjUyNjIwYzFlN2YxNGJiNjMxOEMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyMTI5NjI5NDI0NSwibmFtZSI6Ik1pbnRMSVQifQ.SgkAWF8ctiERQ60hSCKwHFG-xoxmN2-_1dvRIrawmCA'

const NFTStorageClient = new NFTStorage({ token: NFT_STORAGE_API_KEY })

const PINATA_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZTRlMWFkOC0xZDg3LTRlMzMtYmYyMC0zYWE3NjRhODc3YzQiLCJlbWFpbCI6ImNocmlzQGhlbGxvYXByaWNvdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlfSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNzYyMDg4ZGZjYWI0MGRhNmEzYTIiLCJzY29wZWRLZXlTZWNyZXQiOiIxNWQ1NWMzM2M3YzRjZjkyZTRmNzkxNzYxMjMxNTg5Zjc3NWFmMDNjNGYyOWU5NWE0NTAzNjU4NjRjNzQ2MWJlIiwiaWF0IjoxNjIxMjk5MTUxfQ.rBlfJOgcpDNhecYV2-lNqWg5YRwhN7wvrnmxjRu7LEY'

export default function Mint(props) {
  const classes = useStyles()
  const { networkLoading } = props
  const [includedFiles, setIncludedFiles] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [socialMediaUrl, setSocialMediaUrl] = useState('')
  const [chain, setChain] = useState('fantom')
  const [error, setError] = useState('')
  const [minting, setMinting] = useState(false)
  const [mintingComplete, setMintingComplete] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [tokenId, setTokenId] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const [txHash, setTxHash] = useState('')

  useEffect(() => {
    window.LitJsSdk = LitJsSdk // for debug
  }, [])

  const handleSubmit = async () => {
    setMinting(true)
    setMintingComplete(false)
    setError('')

    console.log('encrypting locked files')
    const lockedFiles = includedFiles.filter(f => !f.backgroundImage && f.encrypted)
    const lockedFileMediaGridHtml = createMediaGridHtmlString({ files: lockedFiles })
    const { symmetricKey, encryptedZip } = await LitJsSdk.zipAndEncryptString(lockedFileMediaGridHtml)

    console.log('minting')
    const { tokenId, tokenAddress, mintingAddress, txHash, errorCode, authSig } = await LitJsSdk.mintLIT({ chain, quantity })

    if (errorCode) {
      if (errorCode === 'wrong_chain') {
        setError(
          <>
            <Typography variant='body1'>
              Your Metamask or wallet is on the wrong blockchain.{/* }  If you are trying to mint on Polygon / Matic, follow <Link target='_blank' rel='noreferrer' href='https://medium.com/stakingbits/setting-up-metamask-for-polygon-matic-network-838058f6d844'>these instructions</Link> to add Polygon to your metamask */}
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

    setTokenId(tokenId)
    setTxHash(txHash)

    const accessControlConditions = [
      {
        contractAddress: tokenAddress,
        standardContractType: 'ERC1155',
        chain,
        method: 'balanceOf',
        parameters: [
          ':userAddress',
          tokenId.toString()
        ],
        returnValueTest: {
          comparator: '>',
          value: '0'
        }
      }
    ]

    const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain
    })

    // package up all the stuffs
    console.log('creating html wrapper')
    const htmlString = await createHtmlWrapper({
      title,
      description,
      quantity,
      socialMediaUrl,
      backgroundImage,
      publicFiles: includedFiles.filter(f => !f.backgroundImage && !f.encrypted),
      lockedFiles: await fileToDataUrl(encryptedZip),
      accessControlConditions,
      encryptedSymmetricKey,
      chain
    })

    console.log('uploading html')
    const litHtmlBlob = new Blob(
      [htmlString],
      { type: 'text/html' }
    )

    // const uploadPromise = NFTStorageClient.storeBlob(litHtmlBlob)

    // upload file while saving encryption key on nodes
    const formData = new FormData()
    formData.append('file', litHtmlBlob)
    const uploadPromise = new Promise((resolve, reject) => {
      fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${PINATA_API_KEY}`
        },
        body: formData
      }).then(response => response.json())
        .then(data => resolve(data))
        .catch(err => reject(err))
    })

    // const { balanceStorageSlot } = LitJsSdk.LIT_CHAINS[chain]
    // const merkleProof = await LitJsSdk.getMerkleProof({ tokenAddress, balanceStorageSlot, tokenId })

    const uploadRespBody = await uploadPromise
    console.log('uploadresp is ', uploadRespBody)
    const ipfsCid = uploadRespBody.IpfsHash
    const fileUrl = `https://ipfs.litgateway.com/ipfs/${ipfsCid}`

    console.log('creating token metadata on server')
    console.log(`chain: ${chain}, tokenAddress: ${tokenAddress}, tokenId: ${tokenId}`)
    // save token metadata
    await createTokenMetadata({
      chain,
      tokenAddress,
      tokenId: tokenId.toString(),
      title,
      description,
      socialMediaUrl,
      quantity,
      mintingAddress,
      fileUrl,
      ipfsCid,
      txHash
    })
    setFileUrl(fileUrl)
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
    setFileUrl('')
    setBackgroundImage(null)
    setTokenId(null)
  }

  return (
    <div className={classes.root}>
      <Header networkLoading={networkLoading} />
      <div style={{ height: 24 }} />
      <Container maxWidth='lg' className={classes.fullHeight}>
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
                        Images, videos, audio, and PDF files accepted.  25mb max total.
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
                        accept='video/*,audio/*,image/*,application/pdf'
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
                    {Object.keys(LitJsSdk.LIT_CHAINS).map(k => <MenuItem key={k} value={k}>{LitJsSdk.LIT_CHAINS[k].name}</MenuItem>)}
                  </Select>
                </FormControl>
                <div style={{ height: 16 }} />
                <Button
                  onClick={handleSubmit}
                  variant='outlined'
                  disabled={minting || networkLoading}
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
                <Card className={classes.fullHeight}>
                  <CardContent className={classes.fullHeight}>
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
                <Typography variant='h6'>Token minted!</Typography>
                <Typography variant='h5'>
                  You can find it <Link target='_blank' rel='noreferrer' variant='inherit' href={fileUrl}>here</Link>
                </Typography>
                <Link target='_blank' rel='noreferrer' href={transactionUrl({ chain, txHash, tokenId })}>View Transaction</Link>
                {openseaUrl({ chain, tokenId })
                  ? (
                    <>
                      <br />
                      <Link target='_blank' rel='noreferrer' href={openseaUrl({ chain, tokenId })}>View on Opensea</Link>
                    </>
                  ) : null
                }
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
