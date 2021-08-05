import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(3),
    height: '100%'
  },
  imageAndVideo: {
    objectFit: 'contain',
    maxWidth: '100%',
    maxHeight: '100%',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  audio: {
  },
  audioHolder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  },
  pdfHolder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  },
  fullHeight: {
    height: '100%'
  }
}))

export default function MediaGrid(props) {
  const { files } = props
  const classes = useStyles()
  const maxHeight = 400

  const playerTagForFile = (file) => {
    if (!file.type) {
      return null
    }
    // const fileUrl = URL.createObjectURL(file)
    const fileUrl = file.dataUrl
    if (file.type.includes('image')) {
      return (
        <img className={classes.imageAndVideo} src={fileUrl} style={{ maxHeight: maxHeight || '100%' }} />
      )
    } else if (file.type.includes('audio')) {
      return (
        <div className={classes.audioHolder} style={{ maxHeight: maxHeight || '100%' }}>
          <audio className={classes.audio} controls>
            <source src={fileUrl} type={file.type} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )
    } else if (file.type.includes('video')) {
      return (
        <video className={classes.imageAndVideo} style={{ maxHeight: maxHeight || '100%' }} autoPlay muted loop controls>
          <source src={fileUrl} type={file.type} />
          Your browser does not support the video tag.
        </video>
      )
    } else if (file.type.includes('pdf')) {
      return (
        <embed
          src={fileUrl}
          type="application/pdf"
          frameBorder="0"
          scrolling="auto"
          className={classes.pdfHolder}
          height="100%"
          width="100%"
        ></embed>
      )
    }
  }


  const jsx = []
  for (let i = 0; i < files.length; i++) {
    jsx.push(
      <Grid item key={i} style={files.length === 1 && files[0].type.includes('pdf') ? { width: "100%" } : {}}>
        {playerTagForFile(files[i])}
      </Grid>
    )
  }

  return (
    <div className={classes.root} style={{ height: '100%' }}>
      <Grid
        container
        spacing={1}
        justify='center'
        className={classes.fullHeight}
        style={{ height: '100%' }}
      >
        {jsx}
      </Grid>
    </div>
  )
}
