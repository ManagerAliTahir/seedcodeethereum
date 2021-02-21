require('dotenv').config();
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({limit:'100mb'}));
const AWS = require("aws-sdk");
AWS.config.update({region: "eu-west-1"});
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = process.env.AWS_ACCESS_KEY;

const documentClient = new AWS.DynamoDB.DocumentClient();


app.post('/getContracts', async function (req, res) {
    let params = {
        KeyConditionExpression: 'contract_address = :contract_address',
        TableName: "ehereum_contract",
        ExpressionAttributeValues: {
            ':contract_address': req.body.address
        }
    };
    res.setHeader('Content-Type', 'application/json');
    let result = await documentClient.query(params).promise().then((success) => {
        console.log(success)
        let response = [];
        success.Items.forEach((contract, index, array) => {
            response.push({
                "address": contract.contract_address,
                "adi": contract.abi
            })
        });
        res.json(response);
    }, (error) => {
        console.log(error);
    });
})

app.post("/saveContracts", function (req, res) {
    let response = [];
    req.body.data.forEach(function (contract) {
        let params = {
            TableName: "ehereum_contract",
            Item: {
                "contract_address": contract.hash,
                "abi": contract.abi
            }
        };
        documentClient.put(params, function (err, data) {
            if (err) {
                console.error("Error saving object in dynamo", err);
                response.push({error: err});
            } else {
                console.log("save object in dynamo", data);
                response.push({"status": "success"});
            }
        })
    })

    res.json(response);
})
var server = app.listen(8080, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port)
})