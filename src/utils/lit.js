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
  let css = sheets.toString()
  // loading spinner
  css += `
.lds-ripple {
  display: inline-block;
  position: relative;
  width: 44px;
  height: 40px;
}
.lds-ripple div {
  position: absolute;
  border: 4px solid #000;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes lds-ripple {
  0% {
    top: 16px;
    left: 16px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 32px;
    height: 32px;
    opacity: 0;
  }
}
  `

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
