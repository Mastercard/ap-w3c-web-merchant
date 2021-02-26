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

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const keyPath = './keys';
const log = console;
const algorithm = 'aes-256-cbc';


class EncryptionManager {
    constructor() {
        this.privateKey = null;
        this.publicKey = null
        this.loadKeys();
    }
    decryptPayload(payload, key) {
        const [iv, encryptedText] = payload.split(':').map(part => Buffer.from(part, 'hex'));
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf-8');
    }
    decryptWithPrivateKey(data, privateKey) {
        const buffer = Buffer.from(data, 'base64');
        const decrypted = crypto.privateDecrypt({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, buffer);

        return decrypted.toString('utf-8');
    }
    decrypt(data) {
        const [encryptedSymetricKey, iv, encryptedPayload] = data.split(':');
        const symetricKey = this.decryptWithPrivateKey(encryptedSymetricKey, this.privateKey);
        return this.decryptPayload(`${iv}:${encryptedPayload}`, symetricKey);
    }
    getPublicKey() {
        return this.publicKey
    }
    loadKeys() {
        const _this = this;
        // fs.readFile(path.resolve(keyPath + '/privatekey.pem'), function(error, data) {
        fs.readFile(path.resolve(keyPath + '/privatekey.key'), function (error, data) {
            if (error) {
                log.error('Failed to load the private key file');
            }
            console.log("ghokart.key", data);
            _this.privateKey = data;
        });
        fs.readFile(path.resolve(keyPath + '/publickey.crt'), function (error, data) {
            if (error) {
                log.error('Failed to load the private key file');
            }
            _this.publicKey = data;
        });
    }
}

module.exports = EncryptionManager;