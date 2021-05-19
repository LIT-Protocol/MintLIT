# MintLIT

MintLIT is a demo application of the LIT protocol, which lets you lock and encrypt content behind an NFT.  Most of the documentation lives inside the SDK docs, here: https://github.com/LIT-Protocol/lit-js-sdk

If you wish to deploy your own instance of MintLIT, then read on.

## Getting Started

MintLIT is a React app that uses Firebase for a backend.  To get started, run `yarn` to install dependencies.

You will also need a Firebase project.  Firebase is primarily used for hosting and for metadata storage.  Put your Firebase project config inside src/utils/firebase.js.

## Running

Run `yarn start` to run this project locally.  Note that it will need a Firebase backend to work fully.