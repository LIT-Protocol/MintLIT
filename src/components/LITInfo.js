import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles(theme => ({
  root: {

  },
  leftAlignedText: {
    textAlign: 'left'
  },
  rightAlignedText: {
    textAlign: 'right'
  }
}))
export default function LITInfo (props) {
  const {
    title,
    description,
    quantity,
    socialMediaUrl
  } = props
  const classes = useStyles()

  const fixedSocialMediaUrl = socialMediaUrl.includes('http') ? '' : `https://${socialMediaUrl}`

  return (
    <div className={classes.root}>
      <Grid
        container
        justify='space-between'
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
          <br />
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
        </Grid>
      </Grid>

    </div>
  )
}
