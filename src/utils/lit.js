import React from 'react'

import ReactDOMServer from 'react-dom/server'
import { ServerStyleSheets } from '@material-ui/core/styles'

import Presentation from '../components/Presentation'

import { createHtmlLIT } from 'lit-js-sdk'

export function createHtmlWrapper (props) {
  const { title, encryptedSymmetricKey } = props
  const sheets = new ServerStyleSheets()

  const html = ReactDOMServer.renderToString(sheets.collect(
    <Presentation {...props} />
  ))
  const css = sheets.toString()

  return createHtmlLIT({
    title,
    encryptedSymmetricKey,
    html,
    css
  })
}
