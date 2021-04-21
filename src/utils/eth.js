import Web3 from 'web3'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Fortmatic from 'fortmatic'
import Torus from '@toruslabs/torus-embed'
import Authereum from 'authereum'

import naclUtil from 'tweetnacl-util'
import nacl from 'tweetnacl'
import { toBuffer, bufferToHex } from 'ethereumjs-util'
import { getPublicKey, savePublicKey } from './cloudFunctions'

export async function signMessage ({ body }) {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: 'ddf1ca3700f34497bca2bf03607fde38' // don't care about using env vars for this because it will show up in the web site anyway
      }
    },
    fortmatic: {
      package: Fortmatic,
      options: {
        key: 'pk_live_E6E3D8C6CE0F7BC0' // don't care about using env vars for this because it will show up in the web site anyway
      }
    },
    torus: {
      package: Torus
    },
    authereum: {
      package: Authereum
    }
  }

  const web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: true, // optional
    providerOptions, // required
    disableInjectedProvider: false
  })

  const provider = await web3Modal.connect()

  const web3 = new Web3(provider)

  const accounts = await web3.eth.getAccounts()
  const account = accounts[0]
  console.log('signing with ', account)
  const signature = await web3.eth.personal.sign(body, account)
  const address = web3.eth.accounts.recover(body, signature)

  console.log('Signature: ', signature)
  console.log('recovered address: ', address)

  return { signature, address }
}

export async function connectWalletAndDeriveKeys () {
  const { signature, address } = await signMessage({ body: 'I am creating an account to mint a LIT' })
  console.log('Signed message: ' + signature)

  // derive keypair
  const data = toBuffer(signature)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const uint8Hash = new Uint8Array(hash)
  const { publicKey, secretKey } = nacl.box.keyPair.fromSecretKey(uint8Hash)
  const keypair = {
    publicKey: naclUtil.encodeBase64(publicKey),
    secretKey: naclUtil.encodeBase64(secretKey)
  }
  console.log('public key: ' + keypair.publicKey)
  const asString = JSON.stringify(keypair)
  localStorage.setItem('keypair', asString)

  // is it already saved on the server?
  const { pubkey, errorCode } = await getPublicKey({ address })
  if (errorCode === 'not_found' || pubkey !== keypair.publicKey) {
    // add it
    const msg = 'I am saving my public key so that others can send me LITs'
    const res = await signMessage({ body: msg })
    await savePublicKey({
      sig: res.signature,
      msg,
      pubkey: keypair.publicKey
    })
  }
}
