const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

const provider = new HDWalletProvider(
    'prize muffin front mountain select segment spatial sound deliver oblige book knee',
    'https://ropsten.infura.io/v3/fae9340d61014a1e931fc8096103fc92'
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log("Attempting to deploy from account", accounts[0]);
    console.log("Total accounts",accounts.length);
    console.log(bytecode);
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: '0x'+bytecode })
        .send({ gas: "5000000", from: accounts[0] });
    console.log("Contract deployed to", result.options.address);
};

deploy();