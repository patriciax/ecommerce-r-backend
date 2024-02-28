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
exports.CategoryController = void 0;
const category_schema_1 = require("./../models/category.schema");
// import cloudinary from 'cloudinary'
const apiFeatures_1 = require("../utils/apiFeatures");
const slugify_1 = __importDefault(require("slugify"));
class CategoryController {
    constructor() {
        this.validateFormCreate = (req) => {
            const errors = [];
            if (!req.body.title)
                errors.push('Nombre de categoría es requerido');
            if (!req.body.titleEnglish)
                errors.push('Nombre de categoría en inglés es requerido');
            if (!req.body.categoryType)
                errors.push('Tipo de categoría es requerido');
            // if(!req.body.mainImage) errors.push('Imagen es requerida')
            return errors;
        };
        this.validateFormUpdate = (req) => {
            const errors = [];
            if (!req.body.title)
                errors.push('Nombre de categoría es requerido');
            if (!req.body.titleEnglish)
                errors.push('Nombre de categoría en inglés es requerido');
            if (!req.body.categoryType)
                errors.push('Tipo de categoría es requerido');
            return errors;
        };
        this.createCategory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            //let mainImagePath:any = null
            try {
                const errors = this.validateFormCreate(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                // const images:Array<String> = []
                // let base64Image = req.body.mainImage.split(';base64,').pop();
                // mainImagePath = await digitalOceanUpload(base64Image)
                let slug = `${req.body.title}`;
                slug = (0, slugify_1.default)(slug, { lower: true });
                const results = yield category_schema_1.Category.find({ slug: slug });
                console.log(results);
                if (results.length > 0) {
                    slug = `${slug}-${Date.now()}`;
                }
                const category = yield category_schema_1.Category.create({
                    name: req.body.title,
                    englishName: req.body.titleEnglish,
                    //image: `${process.env.CDN_ENDPOINT}/${mainImagePath}`,
                    categoryType: req.body.categoryType,
                    parent_id: req.body.categoryParent || undefined,
                    slug: slug
                });
                return res.status(201).json({
                    status: 'success',
                    data: category
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.categories = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const features = new apiFeatures_1.APIFeatures(category_schema_1.Category.find(), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();
                const categories = yield features.query;
                const totalCategories = yield category_schema_1.Category.find();
                const totalPages = totalCategories.length / Number(((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: categories.length,
                    data: {
                        categories
                    }
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.updateCategory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = this.validateFormUpdate(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                //let mainImagePath:any = null    
                const category = yield category_schema_1.Category.findById(req.params.id);
                if (!category)
                    return res.status(404).json({ status: 'fail', message: 'No category found with that ID' });
                // mainImagePath = category.image;
                // if (req.body.mainImage) {
                //     let base64Image = req.body.mainImage.split(';base64,').pop();
                //     mainImagePath = await digitalOceanUpload(base64Image);
                //     digitalOceanDelete(category?.image?.split('/').pop() || '');
                // }
                const updatedCategory = yield category_schema_1.Category.findByIdAndUpdate(req.params.id, {
                    name: req.body.title,
                    englishName: req.body.titleEnglish,
                    //image: `${process.env.CDN_ENDPOINT}/${mainImagePath}`,
                    categoryType: req.body.categoryType,
                    parent_id: req.body.categoryParent || undefined,
                }, {
                    new: true,
                    runValidators: true
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        updatedCategory
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
        this.deleteCategory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const category = yield category_schema_1.Category.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
                if (!category)
                    return res.status(404).json({ status: 'fail', message: 'No category found with that ID' });
                return res.status(204).json({
                    status: 'success',
                    data: null
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No category found with that ID'
                });
            }
        });
        this.getCategory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const category = yield category_schema_1.Category.findById(req.params.id);
                if (!category)
                    return res.status(404).json({ status: 'fail', message: 'No category found with that ID' });
                return res.status(200).json({
                    status: 'success',
                    data: category
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No product found with that ID'
                });
            }
        });
        this.menuCategories = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const mainCategories = yield category_schema_1.Category.find({ parent_id: null, categoryType: 'main' });
            const subCategories = yield category_schema_1.Category.find({ categoryType: 'sub' });
            const finalCategories = yield category_schema_1.Category.find({ categoryType: 'final' });
            return res.status(200).json({
                status: 'success',
                data: {
                    mainCategories,
                    subCategories,
                    finalCategories
                }
            });
        });
    }
}
exports.CategoryController = CategoryController;
