"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.digitalOceanDelete = exports.digitalOceanUpload = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const promises_1 = __importDefault(require("fs/promises"));
const decodeBase64mimetype = (base64) => {
    const signatures = {
        R0lGODdh: 'gif',
        R0lGODlh: 'gif',
        iVBORw0KGgo: 'png',
        '/9j/': 'jpg',
        UklGR: 'webp',
        AAAAHGZ0eXBt: 'mp4',
        AAAAFGZ0eXBxdCAgAAACAHF0I: 'mov',
        GkXfo: 'webm'
    };
    for (const sign in signatures)
        if (base64.startsWith(sign))
            return signatures[sign];
};
const deleteDataPromise = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const spacesEndpoint = new aws_sdk_1.default.Endpoint(process.env.DO_SPACES_ENDPOINT || '');
    const s3 = new aws_sdk_1.default.S3({ endpoint: spacesEndpoint, accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
    return new Promise((resolve, reject) => {
        s3.deleteObject({ Bucket: process.env.DO_SPACES_NAME || '', Key: name }, (err, data) => {
            if (err)
                return reject(err);
            resolve(data);
        });
    });
});
const uploadDataPromise = (file, name, mimetype) => __awaiter(void 0, void 0, void 0, function* () {
    const spacesEndpoint = new aws_sdk_1.default.Endpoint(process.env.DO_SPACES_ENDPOINT || '');
    const s3 = new aws_sdk_1.default.S3({ endpoint: spacesEndpoint, accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
    return new Promise((resolve, reject) => {
        s3.putObject({ Bucket: process.env.DO_SPACES_NAME || '', Key: name, Body: file, ACL: "public-read" }, (err, data) => {
            if (err)
                return reject(err);
            resolve(data);
        });
    });
});
const digitalOceanSpaces = (file, name, mimetype) => __awaiter(void 0, void 0, void 0, function* () {
    yield uploadDataPromise(file, name, mimetype);
    return `${name}`;
});
const digitalOceanSpacesDelete = (name) => __awaiter(void 0, void 0, void 0, function* () {
    yield deleteDataPromise(name);
    return `${name}`;
});
const digitalOceanUpload = (base64Image) => __awaiter(void 0, void 0, void 0, function* () {
    const mimeType = decodeBase64mimetype(base64Image);
    const fileName = Date.now();
    yield promises_1.default.writeFile(`uploads/${fileName}.${mimeType}`, base64Image, { encoding: 'base64' });
    const file = yield promises_1.default.readFile(`uploads/${fileName}.${mimeType}`);
    const imagePath = yield digitalOceanSpaces(file, fileName.toString(), mimeType);
    return imagePath;
});
exports.digitalOceanUpload = digitalOceanUpload;
const digitalOceanDelete = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const imagePath = yield digitalOceanSpacesDelete(name);
});
exports.digitalOceanDelete = digitalOceanDelete;
