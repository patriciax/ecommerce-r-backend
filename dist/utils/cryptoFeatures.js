"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptAES256 = exports.encryptAES256 = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const encryptAES256 = (message, key) => {
    // Convertir la llave secreta en un hash SHA256
    const cipherKey = crypto_js_1.default.SHA256(crypto_js_1.default.enc.Utf8.parse(key)).toString();
    // Obtener los primeros 16 bytes del hash
    const keyString = cipherKey.toString();
    const firstHalf = keyString.slice(0, keyString.length / 2);
    const keyHex = crypto_js_1.default.enc.Hex.parse(firstHalf);
    // Encriptacion del mensaje usando la clave nueva   
    const encrypt = crypto_js_1.default.AES.encrypt(message, keyHex, {
        mode: crypto_js_1.default.mode.ECB,
        padding: crypto_js_1.default.pad.Pkcs7
    });
    return crypto_js_1.default.enc.Base64.stringify(encrypt.ciphertext); // Valor devuelto en Base64
};
exports.encryptAES256 = encryptAES256;
const decryptAES256 = (message, key) => {
    // Convertir la llave secreta en un hash SHA256
    const decipherKey = crypto_js_1.default.SHA256(crypto_js_1.default.enc.Utf8.parse(key));
    // Obtener los primeros 16 bytes del hash
    const keyString = decipherKey.toString();
    const firstHalf = keyString.slice(0, keyString.length / 2);
    const keyHex = crypto_js_1.default.enc.Hex.parse(firstHalf);
    // Codificar el mensaje a Base64
    const cipherBytes = crypto_js_1.default.enc.Base64.parse(message);
    // Encriptacion del mensaje usando la clave nueva
    const decrypt = crypto_js_1.default.AES.decrypt({ ciphertext: cipherBytes }, keyHex, {
        mode: crypto_js_1.default.mode.ECB,
        padding: crypto_js_1.default.pad.Pkcs7
    });
    return crypto_js_1.default.enc.Utf8.stringify(decrypt); // Valor devuelto en UTF8
};
exports.decryptAES256 = decryptAES256;
