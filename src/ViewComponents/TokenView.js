import React, { useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import InputAdornment from '@material-ui/core/InputAdornment'

import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import SendIcon from '@material-ui/icons/Send'

import LitJsSdk from 'lit-js-sdk'

const useStyles = makeStyles(theme => ({
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
    height: '100%',
    border: '1px solid black'
  },
  leftAlign: {
    textAlign: 'left'
  }
}))

export default function TokenViewGrid (props) {
  const classes = useStyles()
  const { t } = props
  const [sending, setSending] = useState(false)
  const [addressToSendTo, setAddressToSendTo] = useState('')
  const [tokenSent, setTokenSent] = useState(false)

  if (tokenSent) {
    return (
      <Typography variant='body1'>
        This token has been sent away and you no longer have access to it.
      </Typography>
    )
  }

  const handleSend = async () => {
    if (!sending) {
      // show the address input box
      setSending(true)
      return
    }

    // do the actual send
    const res = await LitJsSdk.sendLIT({ tokenMetadata: t, to: addressToSendTo })
    if (res.success) {
      setTokenSent(true)
    }
  }

  const handleOpenInNew = () => {
    window.open(t.fileUrl)
  }

  const sendButton = (
    <Tooltip title='Send / transfer your LIT to another account'>
      <IconButton onClick={handleSend}><SendIcon /></IconButton>
    </Tooltip>
  )

  return (
    <>
      <Grid container justify='space-between' alignItems='center'>
        <Grid item>
          <Typography variant='h6' className={classes.leftAlign}>
            {t.title}
          </Typography>
        </Grid>
        <Grid item>
          {sending ? null : sendButton}
          {' '}
          <Tooltip title='Open in new tab'>
            <IconButton onClick={handleOpenInNew}><OpenInNewIcon /></IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      {sending
        ? (
          <>
            <TextField
              onChange={e => setAddressToSendTo(e.target.value)}
              value={addressToSendTo}
              label='Address to send to'
              fullWidth
              variant='outlined'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    {sendButton}
                  </InputAdornment>
                )
              }}
            />
            <div style={{ height: 8 }} />
          </>
          )
        : null}

      <div className={classes.frameContainer}>
        <iframe
          title={t.title}
          sandbox='allow-forms allow-scripts allow-popups  allow-modals allow-popups-to-escape-sandbox allow-same-origin'
          className={classes.frame}
          src={t.fileUrl}
          loading='lazy'
          allow='accelerometer; ambient-light-sensor; autoplay; battery; camera; display-capture; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr; screen-wake-lock; web-share; xr-spatial-tracking'
        />
      </div>
    </>
  )
}
