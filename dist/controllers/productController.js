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
exports.ProductController = void 0;
const product_schema_1 = require("./../models/product.schema");
const cloudinary_1 = __importDefault(require("cloudinary"));
const apiFeatures_1 = require("../utils/apiFeatures");
const maxImagesCount_1 = require("../utils/maxImagesCount");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const promises_1 = __importDefault(require("fs/promises"));
class ProductController {
    constructor() {
        this.decodeBase64mimetype = (base64) => {
            const signatures = {
                JVBERi0: 'pdf',
                R0lGODdh: 'gif',
                R0lGODlh: 'gif',
                iVBORw0KGgo: 'png',
                '/9j/': 'jpg',
            };
            for (const sign in signatures)
                if (base64.startsWith(sign))
                    return signatures[sign];
        };
        this.createProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let mainImagePath = null;
            try {
                const images = [];
                let base64Image = req.body.mainImage.split(';base64,').pop();
                const mimeType = this.decodeBase64mimetype(base64Image);
                const fileName = Date.now();
                yield promises_1.default.writeFile(`uploads/${fileName}.${mimeType}`, base64Image, { encoding: 'base64' });
                const file = yield promises_1.default.readFile(`uploads/${fileName}.${mimeType}`);
                mainImagePath = yield this.digitalOceanSpaces(file, fileName.toString(), mimeType);
                for (let i = 0; i < req.body.images.length; i++) {
                    const image = req.body.images[i];
                    let base64Image = req.body.mainImage.split(';base64,').pop();
                    let mimeType = this.decodeBase64mimetype(base64Image);
                    let fileName = Date.now();
                    yield promises_1.default.writeFile(`uploads/${fileName}.${mimeType}`, base64Image, { encoding: 'base64' });
                    const file = yield promises_1.default.readFile(`uploads/${fileName}.${mimeType}`);
                    const imagePath = yield this.digitalOceanSpaces(file, fileName.toString(), mimeType);
                    images.push(`${process.env.CDN_ENDPOINT}/${imagePath}`);
                }
                const product = yield product_schema_1.Product.create({
                    name: req.body.title,
                    description: req.body.description,
                    stock: req.body.stock,
                    price: req.body.price,
                    mainImage: `${process.env.CDN_ENDPOINT}/${mainImagePath}`,
                    images: images
                });
                return res.status(201).json({
                    status: 'success',
                    data: product
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.cloudinaryImageUploadMethod = (file) => __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                cloudinary_1.default.v2.uploader.upload(file, (_err, res) => {
                    resolve({
                        res: res.secure_url,
                    });
                });
            });
        });
        this.uploadDataPromise = (file, name, mimetype) => __awaiter(this, void 0, void 0, function* () {
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
        this.digitalOceanSpaces = (file, name, mimetype) => __awaiter(this, void 0, void 0, function* () {
            yield this.uploadDataPromise(file, name, mimetype);
            return `${name}`;
        });
        this.products = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const features = new apiFeatures_1.APIFeatures(product_schema_1.Product.find(), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();
                const products = yield features.query;
                return res.status(200).json({
                    status: 'success',
                    results: products.length,
                    data: {
                        products
                    }
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.updateProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let mainImagePath = null;
                const newImages = [];
                const product = yield product_schema_1.Product.findById(req.params.id);
                if (!product)
                    return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });
                mainImagePath = product.mainImage;
                const productImages = product.images;
                if (req.files && 'images' in req.files) {
                    if (productImages.length + req.files['images'].length > maxImagesCount_1.maxImagesCount) {
                        return res.status(400).json({ status: 'fail', message: 'You can only have 3 images per product' });
                    }
                }
                if (req.files && 'mainImage' in req.files) {
                    const mainImage = req.files['mainImage'][0];
                    mainImagePath = yield this.cloudinaryImageUploadMethod(mainImage.path);
                    req.body.mainImage = mainImagePath.res;
                }
                if (req.files && 'images' in req.files) {
                    for (let i = 0; i < req.files['images'].length; i++) {
                        const imagePath = yield this.cloudinaryImageUploadMethod(req.files['images'][i].path);
                        newImages.push(imagePath.res);
                    }
                    req.body.images = newImages;
                }
                const updatedProduct = yield product_schema_1.Product.findByIdAndUpdate(req.params.id, req.body, {
                    new: true,
                    runValidators: true
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        updatedProduct
                    }
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: err.message
                });
            }
        });
        this.deleteSecondaryImage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield product_schema_1.Product.findById(req.params.id);
                if (!product)
                    return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });
                const productImages = product.images;
                if (productImages.length <= 0) {
                    return res.status(400).json({ status: 'fail', message: 'There are no secondary images to delete' });
                }
                const secondaryImages = productImages.filter((image) => image !== req.body.image);
                product.images = secondaryImages;
                product.save();
                return res.status(200).json({
                    status: 'success',
                    data: {
                        product
                    }
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: err.message
                });
            }
        });
        this.deleteProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield product_schema_1.Product.findByIdAndDelete(req.params.id);
                if (!product)
                    return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });
                return res.status(204).json({
                    status: 'success',
                    data: null
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No product found with that ID'
                });
            }
        });
        this.getProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield product_schema_1.Product.findById(req.params.id);
                if (!product)
                    return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });
                return res.status(200).json({
                    status: 'success',
                    data: product
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No product found with that ID'
                });
            }
        });
    }
}
exports.ProductController = ProductController;
