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
exports.FooterController = void 0;
const footer_schema_1 = require("../models/footer.schema");
const slugify_1 = __importDefault(require("slugify"));
class FooterController {
    getItemBySlug(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findSlug = yield footer_schema_1.Footer.findOne({ slug: req.params.slug });
                console.log(findSlug);
                if (!findSlug) {
                    return res.status(404).json({
                        status: 'fail'
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    data: findSlug
                });
            }
            catch (error) {
            }
        });
    }
    createFooter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let slug = (0, slugify_1.default)(req.body.title, { lower: true });
                const findSlug = yield footer_schema_1.Footer.findOne({ slug: slug });
                if (findSlug) {
                    slug = slug + '-' + Date.now();
                }
                const footer = yield footer_schema_1.Footer.create({
                    title: req.body.title,
                    titleEnglish: req.body.titleEnglish,
                    description: req.body.description,
                    descriptionEnglish: req.body.descriptionEnglish,
                    section: req.body.section,
                    slug
                });
                return res.status(201).json({
                    status: 'success',
                    data: footer
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({
                    status: 'error',
                });
            }
        });
    }
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const footer = yield footer_schema_1.Footer.find({ section: req.params.section });
                return res.status(200).json({
                    status: 'success',
                    data: footer
                });
            }
            catch (error) {
                return res.status(500).json({ status: 'error' });
            }
        });
    }
    deleteItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const footer = yield footer_schema_1.Footer.findById(req.params.footer);
                if (!footer) {
                    return res.status(404).json({
                        status: 'fail'
                    });
                }
                yield footer_schema_1.Footer.findByIdAndDelete(req.params.footer);
                return res.status(201).json({
                    status: 'success'
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ status: 'error' });
            }
        });
    }
    getItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const footer = yield footer_schema_1.Footer.findById(req.params.footer);
                if (!footer) {
                    return res.status(404).json({
                        status: 'fail'
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    data: footer
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ status: 'error' });
            }
        });
    }
    updateItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const footer = yield footer_schema_1.Footer.findById(req.params.footer);
                if (!footer) {
                    return res.status(404).json({
                        status: 'fail'
                    });
                }
                const updatedFooter = yield footer_schema_1.Footer.findByIdAndUpdate(req.params.footer, {
                    title: req.body.title,
                    titleEnglish: req.body.titleEnglish,
                    description: req.body.description,
                    descriptionEnglish: req.body.descriptionEnglish
                });
                return res.status(200).json({
                    status: 'success',
                    data: updatedFooter
                });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    getItemStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const footer = yield footer_schema_1.Footer.find({});
                if (!footer) {
                    return res.status(404).json({
                        status: 'fail'
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    data: footer
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ status: 'error' });
            }
        });
    }
}
exports.FooterController = FooterController;
