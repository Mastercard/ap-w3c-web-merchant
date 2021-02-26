/**  Copyright (c) 2021 Mastercard
 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 
*/
const express = require("express");
const app = express();
const port = process.env.port || 443;
const path = require("path");
const fs = require("fs");
const https = require('https');
const http = require('http');
const request = require('request');
const KeyManager = require('./keyManager');
const bodyParser = require('body-parser');
const apiURL = 'http://localhost:9999';

const httpsOptions = {
    key: fs.readFileSync('../certificates/ghokart.key'),
    cert: fs.readFileSync('../certificates/ghokart.crt'),
    rejectUnauthorized: false, //add when working with https sites
    requestCert: false, //add when working with https sites
    agent: false,
    ca: fs.readFileSync('../certificates/ghokartBundle.crt')
};
const keyManager = new KeyManager();

app.use(bodyParser.json());
app.use(express.static('assets'));
app.use(express.static('API_test'));

const merchantCertificate = fs.readFileSync('./certs/merchantCert.crt');

app.use(function xFrameOptions(req, res, next) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/view/index.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname + '/view/index.html'));
});

app.get('/handlePaymentsW3c', (req, res) => {
    res.sendFile(path.join(__dirname + '/view/handlePaymentsW3c.html'));
});

app.get('/handlePayments', (req, res) => {
    res.sendFile(path.join(__dirname + '/view/handlePayments.html'));
});

app.get('/apiTest', (req, res) => {
    res.sendFile(path.join(__dirname + '/view/api_demo.html'));
});

app.post('/decrypt', (req, res) => {
    try {
        const data = req.body.data;
        var options = {
            method: 'POST',
            url: `${apiURL}/decrypt`,
            body: data
        };

        request(options, function (error, response, body) {
            if (error) {
                res.send({
                    status: "failure",
                    code: "M5004",
                    message: "Payment response decryption failed"
                });
                res.send();
                return;
            }
            res.send(body);
            res.end();
        });
    } catch (error) {
        res.send({
            status: "failure",
            code: "M5004",
            message: "Payment response decryption failed"
        });
        res.send();
    }
});

app.post('/validateAddress', (req, res) => {
    try {
        const shippingAddress = req.body.shippingAddress;
        var options = {
            method: 'POST',
            url: `${apiURL}/validateaddress`,
            headers: {
                'content-type': 'application/json'
            },
            body: shippingAddress,
            json: true
        };
        request(options, function (error, response, body) {
            if (error) {
                res.send({
                    status: "failure",
                    code: "M5004",
                    message: "Payment response decryption failed"
                });
                res.send();
                return;
            }
            res.send(body);
            res.end();
        });
    } catch (error) {
        res.send({
            status: "failure",
            code: "M5004",
            message: "Payment response decryption failed"
        });
        res.send();
    }
});

app.post('/validatePaymentResponse', (req, res) => {
    try {
        const paymentResponse = req.body.paymentResponse;

        var options = {
            method: 'POST',
            url: `${apiURL}/validatepayment`,
            headers: {
                'content-type': 'application/json'
            },
            body: paymentResponse,
            json: true
        };
        request(options, function (error, response, body) {
            if (error) {
                res.send({
                    status: "failure",
                    code: "M5003",
                    message: "Invalid payment response"
                });
                return;
            }
            res.send(body);
            res.end();
        });
    } catch (error) {
        res.send({
            status: "failure",
            code: "M5003",
            message: "Invalid payment response"
        });
    }
});

app.post('/saveOrder', (req, res) => {
    const orderID = req.body.orderID;
    const orderDesc = req.body.orderDesc;
    var options = {
        method: 'POST',
        url: `${apiURL}/order`,
        headers: {
            'content-type': 'application/json'
        },
        body: {
            'orderID': orderID,
            'orderDesc': JSON.stringify(orderDesc)
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        res.send(body);
        res.end();
    });
});

app.post('/updateOrder', (req, res) => {
    const orderID = req.body.orderID;
    const orderDesc = req.body.orderDesc;
    var options = {
        method: 'PUT',
        url: `${apiURL}/order/${orderID}`,
        headers: {
            'content-type': 'application/json'
        },
        body: {
            'orderID': orderID,
            'orderDesc': JSON.stringify(orderDesc)
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        res.send(body);
        res.end();
    });
});

app.post('/saveAddress', (req, res) => {
    const shippingAddress = req.body.shippingAddress;
    var options = {
        method: 'POST',
        url: `${apiURL}/address`,
        headers: {
            'content-type': 'application/json'
        },
        body: shippingAddress,
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        res.send(body);
        res.end();
    });
});

app.post('/prverify', (req, res) => {
    const sign = req.body.sign;
    var options = {
        method: 'POST',
        url: `${apiURL}/prverify`,
        body: sign
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        res.send(body);
        res.end();
    });
});

app.post('/updateAddress', (req, res) => {
    const shippingAddress = req.body.shippingAddress;
    var options = {
        method: 'POST',
        url: `${apiURL}/address/${shippingAddress.addressID}`,
        headers: {
            'content-type': 'application/json'
        },
        body: shippingAddress,
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        res.send(body);
        res.end();
    });
});

app.get('/certificate.pem', (req, res) => {
    res.set('Content-Type', 'application/x-pem-file');
    res.status(200).send(merchantCertificate);
});

https.createServer(httpsOptions, app).listen(port, '0.0.0.0', () => {
    console.log('server running at ' + port)
});

/*http.createServer(function(req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);*/