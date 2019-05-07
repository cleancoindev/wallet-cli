const program = require('commander')
const process = require('process')
const ethers = require('ethers')
const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const MetronomeContracts = require('metronome-contracts')
var options = { timeout: 50000, autoReconnect: true }
const node_url = 'https://eth.wallet.metronome.io:8545'
const network = 'mainnet'

// const node_url = 'http://127.0.0.1:8545'
// const network = 'ropsten'
const phrase = process.env.phrase
// const phrase = 'your  mnemonic phrase'
const provider = new HDWalletProvider(phrase, node_url, 5, 1)
const myAddresses = provider.addresses
var web3 = new Web3(provider)
var { Auctions, METToken, AutonomousConverter } = new MetronomeContracts(web3, network)

async function info (chain) {
  // console.log(process.env.myphrase)
  console.log('addresses', myAddresses)
  var output = await web3.eth.getBalance(myAddresses[0])
  console.log('My ETH balance', output)
  output = await METToken.methods.balanceOf(myAddresses[0]).call()
  console.log('My MET balance', output)
  var heartbeat = await Auctions.methods.heartbeat().call()
  console.log('heartbeat', heartbeat)
  process.exit(0)
}

async function buyMet (value) {
  var output = await METToken.methods.balanceOf(myAddresses[0]).call()
  console.log('My MET balance before', output)
  await web3.eth.sendTransaction({ to: Auctions.options.address, value, from: myAddresses[0] })
  output = await METToken.methods.balanceOf(myAddresses[0]).call()
  console.log('My MET balance after', output)
  process.exit(0)
}

async function convertEthToMet (value, minReturn) {
  console.log(value)
  var output = await METToken.methods.balanceOf(myAddresses[0]).call()
  console.log('My MET balance before', output)
  await AutonomousConverter.methods.convertEthToMet(minReturn).send({ from: myAddresses[0], value })
  output = await METToken.methods.balanceOf(myAddresses[0]).call()
  console.log('My MET balance after', output)
  process.exit(0)
}

async function convertMetToEth (value, minReturn) {
  console.log(value)
  // await METToken.methods.approve(AutonomousConverter.options.address, value).send({ from: myAddresses[0] })
  var output = await METToken.methods.balanceOf(myAddresses[0]).call()
  console.log('My MET balance before', output)
  await AutonomousConverter.methods.convertMetToEth(value, minReturn).send({ from: myAddresses[0] })
  output = await METToken.methods.balanceOf(myAddresses[0]).call()
  console.log('My MET balance after', output)
  process.exit(0)
}

async function transfer (to, value) {
  console.log('MET balance before', await METToken.methods.balanceOf(provider.addresses[0]).call())
  var tx = await METToken.methods.transfer(to, value).send({ from: provider.addresses[0] })
  console.log('tx hash', tx.transactionHash)
  console.log('MET balance after', await METToken.methods.balanceOf(provider.addresses[0]).call())
  process.exit(0)
}

async function multiTransfer (tokenAmount) {
  const bitParam = []
  const RECIPIENTS = [
    '0xc6b30145441bd12674286c83c1fcd702d2cca265',
    '0xd8252d2741a67c50519f70801fe9e21cf590910c',
    '0xfcfad29bbbab2968790d2d36fbf4a11bcf4abbac'
  ]
  console.log('transfer allowed', await METToken.methods.transferAllowed().call())
  for (let idx = 0; idx < RECIPIENTS.length; idx++) {
    const recipient = RECIPIENTS[idx]
    bitParam.push(recipient + tokenAmount)
    const metBalanceBefore = await METToken.methods.balanceOf(recipient).call()
    console.log('metBalanceBefore', metBalanceBefore)
  }
  try {
    console.log('MET balance before', await METToken.methods.balanceOf(provider.addresses[0]).call())
    await METToken.methods.multiTransfer(bitParam).send({ from: provider.addresses[0] })
    console.log('MET balance after', await METToken.methods.balanceOf(provider.addresses[0]).call())
  } catch (e) {
    console.log(e)
  }
  for (let idx = 0; idx < RECIPIENTS.length; idx++) {
    const recipient = RECIPIENTS[idx]
    const metBalanceAfter = await METToken.methods.balanceOf(recipient).call()
    console.log('metBalanceAfter', metBalanceAfter)
  }
}

function init () {
  program
    .command('info')
    .description('Contract info')
    .action(function () {
      info()
    })
  program
    .command('transfer <to, [value]>')
    .description('transfer MET')
    .action(function (to, value) {
      transfer(to, value)
    })
  program
    .command('convertEthToMet <value, [minReturn]>')
    .description('convert ETH to MET')
    .action(function (value, minReturn) {
      convertEthToMet(value, minReturn)
    })
  program
    .command('convertMetToEth <value, [minReturn]>')
    .description('convert MET to ETH')
    .action(function (value, minReturn) {
      convertMetToEth(value, minReturn)
    })
  program
    .command('buyMet <value>')
    .description('Buy MET in auction')
    .action(function (value) {
      buyMet(value)
    })
  program
    .command('multiTransfer <value>')
    .description('Mass payment')
    .action(function (value) {
      multiTransfer(value)
    })
  program.parse(process.argv)
}

init()
