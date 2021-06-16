import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { Link as RouterLink } from 'react-router-dom'
import Link from '@material-ui/core/Link'
import GitHubIcon from '@material-ui/icons/GitHub'

import LitJsSdk from 'lit-js-sdk'

const useStyles = makeStyles(theme => ({

}))

export default function Header (props) {
  const classes = useStyles()
  const { networkLoading } = props

  return (
    <div className={classes.header}>
      <Grid
        container
        justify='space-between'
        alignItems='center'
      >
        <Grid item>
          <Typography variant='h6'>
            MintLIT
          </Typography>
        </Grid>
        <Grid item>
          {networkLoading
            ? (
              <Grid container alignItems='center'>
                <Grid item>
                  <div className='lds-ripple' id='loadingSpinner'><div /><div /></div>
                </Grid>
                <Grid item>
                  <Typography variant='subtitle1' id='loadingText'>
                    Connecting to the 🔥LIT Protocol...
                  </Typography>
                </Grid>
              </Grid>
              )
            : (
              <Typography variant='subtitle1' id='loadingText'>
                Connected to the 🔥LIT Protocol
              </Typography>
              )}

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
            {/* <Grid item> */}
            {/*   <Link component={RouterLink} to='/transfer'> */}
            {/*     Transfer your LITs */}
            {/*   </Link> */}
            {/* </Grid> */}
            <Grid item>
              <Link href='https://litprotocol.com'>🔥</Link>
            </Grid>
            <Grid item>
              <Link href='https://github.com/LIT-Protocol/MintLIT'><GitHubIcon /></Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}
