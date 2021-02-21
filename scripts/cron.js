require('dotenv').config();
const Web3 = require('web3');
const INFURA_PROJECT_KEY = process.env.INFURA_PROJECT_KEY;
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/' + INFURA_PROJECT_KEY));
const cron = require("node-cron");
const blocks = require("./seedCodes.js");

console.log("Schedule for every day");
cron.schedule("* * 12 * * *", function () {
    web3.eth.getBlockNumber().catch((error => {
        console.log("Error fetching latest block number" + error);
    })).then((number) => {
        console.log("Latest Block Number =" + number);
        console.log("Latest block number  - 200 =" + number - 200);
        blocks.blocks(number - 200, number);
    })
});