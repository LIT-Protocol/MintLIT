import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { Link as RouterLink } from 'react-router-dom'
import Link from '@material-ui/core/Link'

import LitJsSdk from 'lit-js-sdk'

const useStyles = makeStyles(theme => ({

}))

export default function Header () {
  const classes = useStyles()

  const handleConnectWallet = async () => {
    await LitJsSdk.checkAndSignAuthMessage()
  }

  return (
    <div className={classes.header}>
      <Grid
        container
        justify='space-between'
      >
        <Grid item>
          <Typography variant='h6'>
            MintLIT
          </Typography>
        </Grid>
        <Grid item>
          <Grid container spacing={3}>
            <Grid item>
              <Link component={RouterLink} to='/'>
                Mint a LIT
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to='/view'>
                View your LITs
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to='/transfer'>
                Transfer your LITs
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Button onClick={handleConnectWallet}>
            Connect Wallet
          </Button>
        </Grid>
      </Grid>
    </div>
  )
}