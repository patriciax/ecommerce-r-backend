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
const apiFeatures_1 = require("../utils/apiFeatures");
const maxImagesCount_1 = require("../utils/maxImagesCount");
const digitalOceanSpaces_1 = require("../utils/digitalOceanSpaces");
const slugify_1 = __importDefault(require("slugify"));
const category_schema_1 = require("../models/category.schema");
const size_schema_1 = require("../models/size.schema");
const color_schema_1 = require("../models/color.schema");
class ProductController {
    constructor() {
        this.validateFormCreate = (req) => {
            const errors = [];
            if (!req.body.title)
                errors.push('Titulo es requerido');
            if (!req.body.titleEnglish)
                errors.push('Titulo en inglés es requerido');
            if (!req.body.description)
                errors.push('Descripción es requerido');
            if (!req.body.descriptionEnglish)
                errors.push('Descripcion en inglés es requerida');
            if (!req.body.price)
                errors.push('Price es requerido');
            if (!req.body.categories)
                errors.push('Price es requerido');
            if (!req.body.mainImage)
                errors.push('Imágen principal es requerida');
            if (!req.body.productVariations)
                errors.push('Variaciones del producto es requerido');
            if (!req.body.length)
                errors.push('Largo del producto es requerido');
            if (!req.body.width)
                errors.push('Ancho del producto es requerido');
            if (!req.body.height)
                errors.push('Alto del producto es requerido');
            if (!req.body.weight)
                errors.push('Peso del producto es requerido');
            return errors;
        };
        this.validateFormUpdate = (req) => {
            const errors = [];
            if (!req.body.name)
                errors.push('Titulo es requerido');
            if (!req.body.nameEnglish)
                errors.push('Titulo en inglés es requerido');
            if (!req.body.description)
                errors.push('Descripción es requerido');
            if (!req.body.descriptionEnglish)
                errors.push('Descripcion en inglés es requerida');
            if (!req.body.price)
                errors.push('Price es requerido');
            if (!req.body.categories)
                errors.push('Price es requerido');
            if (!req.body.productVariations)
                errors.push('Variaciones del producto es requerido');
            if (!req.body.length)
                errors.push('Largo del producto es requerido');
            if (!req.body.width)
                errors.push('Ancho del producto es requerido');
            if (!req.body.height)
                errors.push('Alto del producto es requerido');
            if (!req.body.weight)
                errors.push('Peso del producto es requerido');
            return errors;
        };
        this.setTags = (tags) => __awaiter(this, void 0, void 0, function* () {
            const excludeWords = ["de", "para", "y", "en", "con", "la", "el", "los", "las", "un", "una", "unos", "unas", "es", "son", "al", "del", "por", "lo", "como", "mas", "muy", "sobre", "bajo", "entre", "hacia", "desde", "hasta", "ante", "tras", "durante", "segun", "sin", "sino", "si", "no", "ni", "tambien", "ademas", "aunque", "pero", "of", "for", "and", "in", "with", "the", "the", "the", "the", "a", "an", "somes", "somes", "is", "are", "at", "of", "for", "lo", "as", "more", "very", "about", "under", "between", "towards", "from", "until", "before", "after", "during", "according to", "without", "but", "if", "no", "nor", "also ", "in addition", "although", "but"];
            const finalTags = [];
            const categories = yield category_schema_1.Category.find({ "_id": { $in: tags.categories } });
            const sizes = yield size_schema_1.Size.find({ "_id": { $in: tags.sizes } });
            const colors = yield color_schema_1.Color.find({ "_id": { $in: tags.colors } });
            if (categories) {
                categories.forEach((category) => {
                    category.name.split(' ').forEach((word) => {
                        if (!excludeWords.includes(this.replaceAccents(word)))
                            finalTags.push(this.replaceAccents(word === null || word === void 0 ? void 0 : word.toLowerCase()));
                    });
                    category.englishName.split(' ').forEach((word) => {
                        if (!excludeWords.includes(this.replaceAccents(word)))
                            finalTags.push(this.replaceAccents(word === null || word === void 0 ? void 0 : word.toLowerCase()));
                    });
                });
            }
            if (sizes) {
                sizes.forEach((size) => {
                    var _a, _b;
                    if (!excludeWords.includes(this.replaceAccents(size.name)))
                        finalTags.push(this.replaceAccents((_a = size.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()));
                    if (!excludeWords.includes(this.replaceAccents(size.englishName)))
                        finalTags.push(this.replaceAccents((_b = size.englishName) === null || _b === void 0 ? void 0 : _b.toLowerCase()));
                });
            }
            if (colors) {
                colors.forEach((color) => {
                    var _a, _b;
                    if (!excludeWords.includes(this.replaceAccents((color.name))))
                        finalTags.push(this.replaceAccents((_a = color.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()));
                    if (!excludeWords.includes(this.replaceAccents(color.englishName)))
                        finalTags.push(this.replaceAccents((_b = color.englishName) === null || _b === void 0 ? void 0 : _b.toLowerCase()));
                });
            }
            tags.name.split(' ').forEach((word) => {
                if (!excludeWords.includes(this.replaceAccents(word)))
                    finalTags.push(this.replaceAccents(word === null || word === void 0 ? void 0 : word.toLowerCase()));
            });
            tags.nameEnglish.split(' ').forEach((word) => {
                if (!excludeWords.includes(this.replaceAccents(word)))
                    finalTags.push(this.replaceAccents(word === null || word === void 0 ? void 0 : word.toLowerCase()));
            });
            return finalTags;
        });
        this.createProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let mainImagePath = null;
            try {
                const errors = this.validateFormCreate(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                const images = [];
                let base64Image = req.body.mainImage.split(';base64,').pop();
                mainImagePath = yield (0, digitalOceanSpaces_1.digitalOceanUpload)(base64Image);
                for (let i = 0; i < req.body.images.length; i++) {
                    const image = req.body.images[i];
                    let base64Image = image.split(';base64,').pop();
                    const imagePath = yield (0, digitalOceanSpaces_1.digitalOceanUpload)(base64Image);
                    images.push(`${process.env.CDN_ENDPOINT}/${imagePath}`);
                }
                let slug = `${req.body.title}`;
                const results = yield product_schema_1.Product.find({
                    $or: [
                        { deletedAt: null },
                        { deletedAt: { $ne: null } }
                    ]
                }, { slug: slug });
                if (results.length > 0) {
                    slug = `${slug}-${Date.now()}`;
                }
                slug = (0, slugify_1.default)(slug, { lower: true });
                const fieldsToTag = {
                    categories: req.body.categories.map((category) => category.id),
                    name: req.body.title,
                    nameEnglish: req.body.titleEnglish,
                };
                const tags = yield this.setTags(fieldsToTag);
                const product = yield product_schema_1.Product.create({
                    categories: req.body.categories.map((category) => category.id),
                    name: req.body.title,
                    nameEnglish: req.body.titleEnglish,
                    description: req.body.description,
                    descriptionEnglish: req.body.descriptionEnglish,
                    price: req.body.price,
                    priceDiscount: req.body.priceDiscount,
                    mainImage: `${process.env.CDN_ENDPOINT}/${mainImagePath}`,
                    images: images,
                    showInHomeSection: req.body.showInHomeSection,
                    slug: slug,
                    productVariations: req.body.productVariations,
                    tags: tags,
                    length: req.body.length,
                    width: req.body.width,
                    height: req.body.height,
                    weight: req.body.weight
                });
                return res.status(201).json({
                    status: 'success',
                    data: product
                });
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ message: err.message });
            }
        });
        this.products = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const features = new apiFeatures_1.APIFeatures(product_schema_1.Product.find(), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();
                const products = yield features.query;
                const totalProducts = yield product_schema_1.Product.find();
                const totalPages = totalProducts.length / Number(((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
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
            var _b;
            try {
                const errors = this.validateFormUpdate(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                let mainImagePath = null;
                const newImages = [];
                const product = yield product_schema_1.Product.findById(req.params.id);
                if (!product)
                    return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });
                const images = [];
                if (req.body.mainImage) {
                    let base64Image = req.body.mainImage.split(';base64,').pop();
                    mainImagePath = yield (0, digitalOceanSpaces_1.digitalOceanUpload)(base64Image);
                    (0, digitalOceanSpaces_1.digitalOceanDelete)(((_b = product === null || product === void 0 ? void 0 : product.mainImage) === null || _b === void 0 ? void 0 : _b.split('/').pop()) || '');
                }
                if (req.body.images) {
                    for (let i = 0; i < req.body.images.length; i++) {
                        const image = req.body.images[i];
                        let base64Image = image.split(';base64,').pop();
                        const imagePath = yield (0, digitalOceanSpaces_1.digitalOceanUpload)(base64Image);
                        images.push(`${process.env.CDN_ENDPOINT}/${imagePath}`);
                    }
                }
                if (product.images.length + images.length > maxImagesCount_1.maxImagesCount) {
                    return res.status(422).json({ status: 'fail', message: `You can only have ${maxImagesCount_1.maxImagesCount} images` });
                }
                product.images.forEach((image) => {
                    images.push(image);
                });
                const fieldsToTag = {
                    categories: req.body.categories.map((category) => { var _a; return (_a = category.id) !== null && _a !== void 0 ? _a : category; }),
                    name: req.body.name,
                    nameEnglish: req.body.nameEnglish
                };
                const tags = yield this.setTags(fieldsToTag);
                const updatedProduct = yield product_schema_1.Product.findByIdAndUpdate(req.params.id, {
                    showInHomeSection: req.body.showInHomeSection,
                    categories: req.body.categories.map((category) => { var _a; return (_a = category.id) !== null && _a !== void 0 ? _a : category; }),
                    name: req.body.name,
                    nameEnglish: req.body.nameEnglish,
                    description: req.body.description,
                    descriptionEnglish: req.body.descriptionEnglish,
                    stock: req.body.stock,
                    price: req.body.price,
                    priceDiscount: req.body.priceDiscount,
                    mainImage: req.body.mainImage ? `${process.env.CDN_ENDPOINT}/${mainImagePath}` : product.mainImage,
                    images: req.body.images.length > 0 ? images : product.images,
                    productVariations: req.body.productVariations,
                    length: req.body.length,
                    width: req.body.width,
                    height: req.body.height,
                    weight: req.body.weight
                }, {
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
                const productImageToDelete = productImages.find(image => image.includes(req.params.imageId));
                (0, digitalOceanSpaces_1.digitalOceanDelete)((productImageToDelete === null || productImageToDelete === void 0 ? void 0 : productImageToDelete.split('/').pop()) || '');
                const secondaryImages = productImages.filter((image) => image !== productImages.find(image => image.includes(req.params.imageId)));
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
                const product = yield product_schema_1.Product.findByIdAndUpdate(req.params.id, {
                    deletedAt: Date.now(),
                });
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
            let product = null;
            try {
                product = yield product_schema_1.Product.findOne({ _id: req.params.id }).populate('productVariations.size')
                    .populate('productVariations.color');
                return res.status(200).json({
                    status: 'success',
                    data: product
                });
            }
            catch (err) {
                try {
                    if (!product)
                        product = yield product_schema_1.Product.findOne({ slug: req.params.id }).populate('productVariations.size').populate('productVariations.color');
                    if (!product)
                        return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });
                    return res.status(200).json({
                        status: 'success',
                        data: product
                    });
                }
                catch (error) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'No product found with that ID'
                    });
                }
            }
        });
        this.productInHome = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const section1Products = yield product_schema_1.Product.find({ showInHomeSection: 'section-1' }).sort({ 'createdAt': -1 }).limit(12);
                const section2Products = yield product_schema_1.Product.find({ showInHomeSection: 'section-2' }).sort({ 'createdAt': -1 }).limit(20);
                const section3Products = yield product_schema_1.Product.find({ showInHomeSection: 'section-3' }).sort({ 'createdAt': -1 }).limit(12);
                return res.status(200).json({
                    status: 'success',
                    data: {
                        "section1": section1Products,
                        "section2": section2Products,
                        "section3": section3Products
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
        this.dailySaleProducts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c;
            try {
                const features = new apiFeatures_1.APIFeatures(product_schema_1.Product.find({ priceDiscount: { $ne: 0 } }), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();
                const products = yield features.query;
                const productFeatures = new apiFeatures_1.APIFeatures(product_schema_1.Product.find({ priceDiscount: { $ne: 0 } }), req.query)
                    .filter()
                    .sort()
                    .limitFields();
                const totalProducts = yield productFeatures.query;
                const totalPages = totalProducts.length / Number(((_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: products.length,
                    data: {
                        products
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
        this.searchProducts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _d;
            try {
                const textSearch = this.replaceAccents(req.body.textSearch.toLowerCase());
                const splittedText = textSearch.split(' ');
                const categories = req.body.categories;
                const data = {
                    tags: { $in: splittedText },
                    categories: (categories === null || categories === void 0 ? void 0 : categories.length) > 0 ? { $in: categories } : { $exists: true }
                };
                const features = new apiFeatures_1.APIFeatures(product_schema_1.Product.find(data), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();
                const products = yield features.query;
                const totalProducts = yield product_schema_1.Product.find(data);
                const totalPages = totalProducts.length / Number(((_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: products.length,
                    data: {
                        products
                    }
                });
            }
            catch (err) {
                console.log(err);
                return res.status(404).json({
                    status: 'fail',
                    message: 'PRODUCT_NOT_FOUND'
                });
            }
        });
        this.productsByCategory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _e;
            try {
                const features = new apiFeatures_1.APIFeatures(product_schema_1.Product.find({ categories: { $in: [req.params.categoryId] } }), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();
                const products = yield features.query;
                const totalProducts = yield product_schema_1.Product.find({ categories: { $in: [req.params.categoryId] } });
                const totalPages = totalProducts.length / Number(((_e = req === null || req === void 0 ? void 0 : req.query) === null || _e === void 0 ? void 0 : _e.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: products.length,
                    data: {
                        products
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
    }
    replaceAccents(str) {
        return str === null || str === void 0 ? void 0 : str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
}
exports.ProductController = ProductController;
