import React, { useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'

import Info from './Info'
import MediaGrid from './MediaGrid'

import { decryptZip } from '../utils/lit'

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
    publicFiles,
    lockedFiles,
    backgroundImage,
    previewMode,
    lockedFilesForPreview
  } = props
  const classes = useStyles()
  const [locked, setLocked] = useState(true)
  const [decryptedFiles, setDecryptedFiles] = useState(null)

  const handleToggleLock = async () => {
    if (locked) {
      // unlock
      if (!decryptedFiles && !previewMode) {
        // need to decrypt the files
        const files = await decryptZip(lockedFiles, window.encryptedSymmetricKey)
        setDecryptedFiles(files)
      }
      setLocked(false)
    } else {
      // lock
      setLocked(true)
    }
  }

  let showingFiles = publicFiles
  if (!locked) {
    if (previewMode) {
      showingFiles = lockedFilesForPreview
    } else {
      showingFiles = decryptedFiles
    }
  }

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
      {showingFiles.length > 0
        ? (
          <div style={{ backgroundImage: `url(${backgroundImage?.dataUrl})` }} className={classes.mediaGrid}>
            <MediaGrid files={showingFiles} />
          </div>
          )
        : null}

    </>
  )
}
