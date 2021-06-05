import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Container from '@material-ui/core/Container'
import CircularProgress from '@material-ui/core/CircularProgress'

import LitJsSdk from 'lit-js-sdk'

import Header from './Header'
import TokenViewGrid from './ViewComponents/TokenViewGrid'
import { getMetadata } from './utils/firestore'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    textAlign: 'center',
    maxWidth: 1300,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  frameContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '75%'
  },
  frame: {
    position: 'absolute',
    top: '0',
    left: '0',
    bottom: '0',
    right: '0',
    width: '100%',
    height: '100%'
  }
}))

export default function View () {
  const classes = useStyles()
  const [tokenMetadata, setTokenMetadata] = useState(null)

  useEffect(async () => {
    const { tokenIds, chain } = await LitJsSdk.findLITs()
    console.log('tokenIds', tokenIds)
    console.log('chain', chain)
    const metadata = await getMetadata({ tokenIds, chain })
    console.log(metadata)
    setTokenMetadata([metadata[0]])
  }, [])

  return (
    <div className={classes.root}>
      <Header />
      <div style={{ height: 24 }} />
      <Container maxWidth='lg'>
        <Card>
          <CardContent>
            {tokenMetadata
              ? (
                <TokenViewGrid tokenMetadata={tokenMetadata} />
                )
              : <CircularProgress />}
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
