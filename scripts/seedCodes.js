require('dotenv').config();
const Web3 = require('web3');
const INFURA_PROJECT_KEY = process.env.INFURA_PROJECT_KEY;
const ETHEREUM_API_KEY = process.env.ETHEREUM_API_KEY;
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/' + INFURA_PROJECT_KEY));
const https = require('https')
const axios = require('axios')

let contractsMap = new Map();

function saveMapInDynamo() {
    let url = "http://localhost:8080/saveContracts";
    var postData = {
        data: []
    };
    for ([key, value] of contractsMap) {
        if (value !== "Contract") {
            postData.data.push({
                hash: key,
                abi: value
            })
        }
    }
    axios.post(url, postData).then(res => {
        console.log(res);
    }).catch(error => {
        console.error(error);
    });
}

async function getContractsAndName(index) {
    if (contractsMap.size > 0) {
        if (index < contractsMap.size) {
            try {
                var key = Array.from(contractsMap.keys())[index];
                await getABIForContract(key);
            } catch (err) {
                console.log("Error in get contract for key = " + index);
            }
            setTimeout(function () {
                getContractsAndName(index + 1);
            }, 1000);
        } else {
            saveMapInDynamo();
        }

    }
}

//considering one block for testing
let blocks = function processBlocksFromItoN(i, n) {
    if (i == null) {
        i = 11741188;
    }
    if (n == null) {
        n = 11741189;
    }
    for (; i < n; i++) {
        web3.eth.getBlock(i, true, function (err, result) {
                if (!err) {
                    console.log(result.number);
                    if (result.transactions != null && result.transactions.length > 0) {
                        for (let j = 0; j < result.transactions.length; j++) {
                            if (result.transactions[j].to != null) {
                                console.log('Transactions To: ' + JSON.stringify(result.transactions[j].hash));
                                getContractAddressAgainstTransaction(result.transactions[j].to);
                            } else {
                                console.log("transactions " + result.transactions[j].hash + " with no created contract at to =" + result.transactions[j].to);
                            }
                        }
                        getContractsAndName(0);
                        console.log(contractsMap);

                    } else {
                        console.log("No Transactions Found")
                    }
                } else {
                    console.log('Error!', err);
                }
            }
        );
    }
}

blocks(11741188,11741189);

//getContractAddress from Transaction Receipt And Save in DB
function getContractAddressAgainstTransaction(hashTo) {
    if (!contractsMap.has(hashTo)) {
        contractsMap.set(hashTo, "Contract");
    }
//    web3.eth.getTransactionReceipt(hashTo).then(getAndSaveContract,(error) => console.log("Error in fetching contract" + error));
}


//toGetABIAndStoreInMap
function getABIForContract(hash) {
    let url = options.hostname + options.path + "?module=" + params.module + "&action=" + params.action
        + "&address=" + hash + "&apikey=" + ETHEREUM_API_KEY;
    https.get(url, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

        res.on('data', (data) => {
            try {
                const response = JSON.parse(data);
                if (response.status !== 0 && !response.message !== "NOTOK" && response.result !== "Contract source code not verified") {
                    let abi = null;
                    try {
                        abi = JSON.parse(response.result);
                    } catch (error) {
                        console.log(error);
                    }
                    if (abi != null) {
                        contractsMap.set(hash, abi);
                        getContract(hash, abi);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        });

    }).on('error', (error) => {
        console.error("error in consuming ethereum api = " + error);
    });
}


//toGetNameAgainstContract
function getContract(hash, jsonInterface) {
    let contract = new web3.eth.Contract(jsonInterface);
    contract.options.address = hash;
    // let result = myContractInstance.memberId(hash);
    // console.log("result1 : " + result);
    // result = myContractInstance.members(1);
    // console.log("result2 : " + result);

}


module.exports = {
    blocks
}


const options = {
    hostname: "https://api.etherscan.io",
    path: '/api'
}

const params = {
    module: "contract",
    action: "getabi"
}