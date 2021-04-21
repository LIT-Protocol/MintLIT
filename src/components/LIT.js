import React from 'react'
import LITInfo from './LITInfo'
import MediaGrid from './MediaGrid'

export default function LIT (props) {
  const {
    title,
    description,
    quantity,
    socialMediaUrl,
    files
  } = props

  return (
    <>
      <LITInfo
        title={title}
        description={description}
        quantity={quantity}
        socialMediaUrl={socialMediaUrl}
      />
      <div style={{ height: 16 }} />
      <MediaGrid files={files} />
    </>
  )
}
