const assert = require('assert');
//Local test network
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const {interface, bytecode} = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
    //Get a list of all accounts
    accounts = await web3.eth.getAccounts()

    //Use one of the accounts to deploy the contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({from: accounts[0], gas: '1000000'})

});

describe('Lottery', () => {
    it('deploys a contract', () => {
        //ensure that the contract has been deployed
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.takePart().send({
            from: accounts[0],
            value: '11',
            gas: '1000000'
        })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    })

    it('allows multiple account to enter', async () => {
        await lottery.methods.takePart().send({
            from: accounts[0],
            value: '11',
            gas: '1000000'
        })

        await lottery.methods.takePart().send({
            from: accounts[1],
            value: '11',
            gas: '1000000'
        })

        await lottery.methods.takePart().send({
            from: accounts[2],
            value: '11',
            gas: '1000000'
        })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    })

    it('requires a minimum amount of wei to enter', async () => {
        
        try{
            await lottery.methods.takePart().send({
                from: accounts[0],
                value: '10'
            });
            assert(false);
        } catch(err){
            assert(err);
        }
    })

    it('only manager can call pickWinner', async () => {
        try{
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch(err){
            assert(err);
        }
    })

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.takePart().send({
            from: accounts[1],
            value: web3.utils.toWei('2', 'ether')
        })

        const initialBalance = await web3.eth.getBalance(accounts[1]);
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        })
        const finalBalance = await web3.eth.getBalance(accounts[1]);
        const difference = finalBalance - initialBalance;

        //Since some amount went into GAS, we need to subtract it from the difference
        assert(difference > web3.utils.toWei('1.8', 'ether'));
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.equal(0, players.length);
    });
});