import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'

import LockOpenIcon from '@material-ui/icons/LockOpen'
import LockIcon from '@material-ui/icons/Lock'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: 'white'
  },
  leftAlignedText: {
    textAlign: 'left'
  },
  rightAlignedText: {
    textAlign: 'right'
  },
  gridContainer: {
    flexWrap: 'nowrap'
  }
}))
export default function Info (props) {
  const {
    title,
    description,
    quantity,
    socialMediaUrl,
    locked,
    handleToggleLock
  } = props
  const classes = useStyles()

  const fixedSocialMediaUrl = socialMediaUrl.includes('http') ? '' : `https://${socialMediaUrl}`

  return (
    <div className={classes.root}>
      <Grid
        container
        justify='space-between'
        className={classes.gridContainer}
      >
        <Grid item className={classes.leftAlignedText}>
          <Typography variant='h3'>
            {title}
          </Typography>
          <Typography variant='subtitle1'>
            {description}
          </Typography>
        </Grid>
        <Grid item className={classes.rightAlignedText}>
          <Typography variant='subtitle1'>
            {quantity} edition{quantity > 1 ? 's' : ''}
          </Typography>
          <div style={{ height: 1 }} />
          {socialMediaUrl
            ? (
              <Link
                href={fixedSocialMediaUrl}
                target='_blank'
                rel='noreferrer'
              >
                {socialMediaUrl}
              </Link>
              )
            : null}
          <div style={{ height: 8 }} />
          {locked
            ? (
              <Button
                onClick={handleToggleLock}
                variant='contained'
                startIcon={<LockOpenIcon />}
              >
                Unlock
              </Button>
              )
            : (
              <Button
                onClick={handleToggleLock}
                variant='contained'
                startIcon={<LockIcon />}
              >
                Lock
              </Button>
              )}
        </Grid>
      </Grid>
      {locked
        ? (
          <Typography variant='h5'>
            LOCKED
          </Typography>
          )
        : (
          <Typography variant='h5'>
            UNLOCKED
          </Typography>
          )}
      <div style={{ height: 16 }} />

    </div>
  )
}
