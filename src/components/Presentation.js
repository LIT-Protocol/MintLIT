import React from 'react'
import Info from './LITInfo'
import MediaGrid from './MediaGrid'

export default function Presentation (props) {
  const {
    title,
    description,
    quantity,
    socialMediaUrl,
    files
  } = props

  return (
    <>
      <Info
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
