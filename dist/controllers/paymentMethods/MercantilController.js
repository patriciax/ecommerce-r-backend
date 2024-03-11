"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercantilController = void 0;
const crypto_1 = require("crypto");
class MercantilController {
    constructor() {
        this.OPENSSL_CIPHER_NAME = "aes-128-ecb";
        this.CIPHER_KEY_LEN = 16;
        this.createKeyhash = (keybank) => {
            const keyBankUTF8 = Buffer.from(keybank, "utf8");
            const keyBankHash = (0, crypto_1.createHash)("sha256").update(keyBankUTF8).digest("binary");
            return keyBankHash;
        };
        this.fixKey = (key) => {
            if (key.length < this.CIPHER_KEY_LEN) {
                key = this.str_pad(key, this.CIPHER_KEY_LEN, "0");
            }
            if (key.length > this.CIPHER_KEY_LEN) {
                //truncate to 16 bytes
                key = key.slice(0, this.CIPHER_KEY_LEN);
                ;
            }
            return key;
        };
    }
    str_pad(input, length, padString) {
        input = input.toString();
        while (input.length < length) {
            input = padString + input;
        }
        return input;
    }
    encrypt(key, data) {
        const cipher = (0, crypto_1.createCipheriv)(this.OPENSSL_CIPHER_NAME, key, '');
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const base64Encoded = Buffer.from(encrypted, 'base64').toString('base64');
        return base64Encoded;
    }
    decrypt(key, data) {
        const decodedData = Buffer.from(data, 'base64').toString('binary');
        const decipher = (0, crypto_1.createDecipheriv)(this.OPENSSL_CIPHER_NAME, key, '');
        let decrypted = decipher.update(decodedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
exports.MercantilController = MercantilController;
