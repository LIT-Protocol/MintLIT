import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import AppRouter from './AppRouter'
import reportWebVitals from './reportWebVitals'

import LitJsSdk from 'lit-js-sdk'

import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'

Bugsnag.start({
  apiKey: 'edfb9568fc491d150ef8eb65a8ef5e4e',
  plugins: [new BugsnagPluginReact()]
})

const ErrorBoundary = Bugsnag.getPlugin('react')
  .createErrorBoundary(React)

// for dev
// const client = new LitJsSdk.LitNodeClient({
//   alertWhenUnauthorized: true,
//   minNodeCount: 8,
//   bootstrapUrls: ['/dns4/dev1.litgateway.com/tcp/9090/https/p2p-webrtc-direct/p2p/12D3KooWK1KtaAV5rWjbAmZcd62VYSmEz1k81jzr87JAcSS7rKdQ']
// })
const client = new LitJsSdk.LitNodeClient()
client.connect()
window.litNodeClient = client

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
