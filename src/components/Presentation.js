import React, { useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'

import Info from './Info'
import MediaGrid from './MediaGrid'

const useStyles = makeStyles(theme => ({
  mediaGrid: {
    padding: theme.spacing(1),
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover'
  }
}))

export default function Presentation (props) {
  const {
    title,
    description,
    quantity,
    socialMediaUrl,
    files,
    backgroundImage
  } = props
  const classes = useStyles()
  const [locked, setLocked] = useState(true)

  const handleToggleLock = () => {
    if (locked) {
      // unlock
      setLocked(false)
    } else {
      // lock
      setLocked(true)
    }
  }

  const showingFiles = files.filter(f => !f.backgroundImage && f.encrypted === !locked)

  return (
    <>
      <Info
        title={title}
        description={description}
        quantity={quantity}
        socialMediaUrl={socialMediaUrl}
        locked={locked}
        handleToggleLock={handleToggleLock}
      />
      <div style={{ backgroundImage: `url(${backgroundImage?.dataUrl})` }} className={classes.mediaGrid}>
        <MediaGrid files={showingFiles} />
      </div>
    </>
  )
}
