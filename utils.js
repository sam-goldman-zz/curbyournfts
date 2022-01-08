var Accounts = require('web3-eth-accounts');
var accounts = new Accounts('ws://localhost:8546');

// Generates 5,000 accounts to use in Hardhat Network
const numAccounts = 5000;
let accountArray = [];
for (let i = 0; i < numAccounts; i++) {
  account = accounts.create();
  accountArray.push({
    privateKey: account.privateKey,
    balance: 10000
  });
}