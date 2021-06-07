import React from 'react'

import ReactDOMServer from 'react-dom/server'
import { ServerStyleSheets } from '@material-ui/core/styles'
import LitJsSdk from 'lit-js-sdk'

import Presentation from '../components/Presentation'
import MediaGrid from '../components/MediaGrid'

export function createHtmlWrapper ({
  title,
  description,
  quantity,
  socialMediaUrl,
  backgroundImage,
  publicFiles,
  lockedFiles,
  tokenAddress,
  tokenId,
  chain
}) {
  // save head before.  this is because ServerStyleSheets will add the styles to the HEAD tag and we need to restore them
  const HTMLHeadBefore = document.head.innerHTML
  const sheets = new ServerStyleSheets()

  const htmlBody = ReactDOMServer.renderToString(sheets.collect(
    <Presentation
      title={title}
      description={description}
      quantity={quantity}
      socialMediaUrl={socialMediaUrl}
      backgroundImage={backgroundImage}
      publicFiles={publicFiles}
    />
  ))
  const css = sheets.toString()

  // put head back
  document.head.innerHTML = HTMLHeadBefore

  return LitJsSdk.createHtmlLIT({
    title,
    htmlBody,
    css,
    tokenAddress,
    tokenId,
    chain,
    encryptedZipDataUrl: lockedFiles
  })
}

export function createMediaGridHtmlString ({
  files
}) {
  const html = ReactDOMServer.renderToString(
    <MediaGrid
      files={files}
    />
  )
  return html
}
