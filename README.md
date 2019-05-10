# wallet-cli

Prerequisite

1) node v10 or above
 
2) Ethereum address and mnemonic phrase
 
3) Eth balance to pay for gas fee


Setup
1) git clone https://github.com/autonomoussoftware/wallet-cli.git

2) cd wallet-cli

3) npm i

4) set mnenomnic phrase using one of two 

    a) using environment vairable by typing below line in terminal

    phrase='your actual mnemonic phrase'

    or

    update below line in wallet.js 

    const phrase = 'your actual mnemonic phrase'

5) node wallet.js functioName argument

examples- 

node wallet.js info

node wallet.js convertEthToMet amount minimumReturn

node wallet.js convertMetToEth amount minimumReturn

node wallet.js buyMet ethAmount
