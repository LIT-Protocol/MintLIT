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
import LIT from '../abis/LIT.json'

const CHAINS = {
  polygon: {
    contractAddress: '0xb9A323711528D0c5a70df790929f4739f1cDd7fD',
    chainId: 137
  },
  ethereum: {
    contractAddress: '0x55485885e82E25446DEC314Ccb810Bda06B9e01B',
    chainId: 1
  }
}

const KEY_DERIVATION_SIGNATURE_BODY = 'I am creating an account to mint a LIT'

export async function checkAndDeriveKeypair () {
  let keypair = localStorage.getItem('keypair')
  if (!keypair) {
    await deriveEncryptionKeys()
    keypair = localStorage.getItem('keypair')
  }
  keypair = JSON.parse(keypair)
  const { web3, account } = await connectWeb3()
  // make sure we are on the right account
  if (account !== keypair.address) {
    await deriveEncryptionKeys()
    keypair = localStorage.getItem('keypair')
    keypair = JSON.parse(keypair)
  }
  return keypair
}

async function connectWeb3 () {
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
  return { web3, account }
}

export async function signMessage ({ body }) {
  const { web3, account } = await connectWeb3()

  console.log('signing with ', account)
  const signature = await web3.eth.personal.sign(body, account)
  const address = web3.eth.accounts.recover(body, signature)

  console.log('Signature: ', signature)
  console.log('recovered address: ', address)

  if (address !== account) {
    const msg = `ruh roh, the user signed with a different address (${address}) then they\'re using with web3 (${account}).  this will lead to confusion.`
    console.error(msg)
    alert('something seems to be wrong with your wallets message signing.  maybe restart your browser or your wallet.  your recovered sig address does not match your web3 account address')
    throw new Error(msg)
  }

  return { signature, address }
}

export async function decryptWithWeb3PrivateKey (encryptedData) {
  const { web3, account } = await connectWeb3()
  try {
    const decryptedMessage = ethereum
      .request({
        method: 'eth_decrypt',
        params: [encryptedData, account]
      })
    return decryptedMessage
  } catch (error) {
    console.log(error)
    return false
  }
}

async function deriveKeysViaSignature () {
  const { signature, address } = await signMessage({ body: KEY_DERIVATION_SIGNATURE_BODY })
  console.log('Signed message: ' + signature)

  // derive keypair
  const data = toBuffer(signature)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const uint8Hash = new Uint8Array(hash)
  const { publicKey, secretKey } = nacl.box.keyPair.fromSecretKey(uint8Hash)
  return {
    publicKey: naclUtil.encodeBase64(publicKey),
    secretKey: naclUtil.encodeBase64(secretKey)
  }
}

// this only works on metamask :(
async function deriveKeysViaPrivateKey () {
  try {
    const { web3, account } = await connectWeb3()
    /* global ethereum */
    /* eslint no-undef: "error" */
    const publicKey = await ethereum
      .request({
        method: 'eth_getEncryptionPublicKey',
        params: [account] // you must have access to the specified account
      })
    return { publicKey }
  } catch (error) {
    console.log(error)
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      console.log("We can't encrypt anything without the key.")
      error('You must accept the metamask request to derive your public encryption key')
    } else {
      console.error(error)
    }
    return { error }
  }
}

export async function deriveEncryptionKeys () {
  let keypair = {}
  // key derivation via metamask is more desirable because then even this SDK can't see the secret key :-D
  const { error, publicKey } = await deriveKeysViaPrivateKey()
  if (!error) {
    keypair = {
      publicKey,
      derivedVia: 'eth_getEncryptionPublicKey'
    }
  } else {
    const { publicKey, secretKey } = await deriveKeysViaSignature()
    keypair = {
      publicKey,
      secretKey,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: KEY_DERIVATION_SIGNATURE_BODY
    }
  }

  const { web3, account } = await connectWeb3()
  keypair.address = account

  console.log('public key: ' + keypair.publicKey)
  const asString = JSON.stringify(keypair)
  localStorage.setItem('keypair', asString)

  // is it already saved on the server?
  const { pubkey, errorCode } = await getPublicKey({
    address: account
  })
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

// function sleep (milliseconds) {
//   return new Promise(resolve => setTimeout(resolve, milliseconds))
// }
//
// async function waitUntilTxConfirmed ({ web3, txHash }) {
//   console.log('waitUntilTxConfirmed...')
//   const tx = await web3.eth.getTransactionReceipt(txHash)
//   if (!tx) {
//     await sleep(1000)
//     return waitUntilTxConfirmed({ web3, txHash })
//   }
//   return tx
// }

export async function mintLIT ({ chain, quantity }) {
  console.log(`minting ${quantity} tokens on ${chain}`)
  await checkAndDeriveKeypair()
  const { web3, account } = await connectWeb3()
  const chainId = await web3.eth.getChainId()
  if (chainId !== CHAINS[chain].chainId) {
    return { errorCode: 'wrong_chain' }
  }
  const tokenAddress = CHAINS[chain].contractAddress
  const contract = new web3.eth.Contract(LIT.abi, tokenAddress)
  console.log('sending to chain...')
  try {
    const txReceipt = await contract.methods.mint(quantity).send({ from: account })
    console.log('txReceipt: ', txReceipt)
    const tokenId = txReceipt.events.TransferSingle.returnValues.id
    return {
      txHash: txReceipt.transactionHash,
      tokenId,
      tokenAddress,
      mintingAddress: account
    }
  } catch (error) {
    console.log(error)
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      console.log('User rejected request')
      return { errorCode: 'user_rejected_request' }
    } else {
      console.error(error)
    }
    return { errorCode: 'unknown_error' }
  }
}
