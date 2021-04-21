import firebase from './firebase'

export async function savePublicKey (data) {
  const fn = firebase.functions().httpsCallable('savePublicKey')
  const result = await fn(data)
  console.log(result)
  return result.data
}

export async function getPublicKey (data) {
  const fn = firebase.functions().httpsCallable('getPublicKey')
  const result = await fn(data)
  console.log(result)
  return result.data
}
