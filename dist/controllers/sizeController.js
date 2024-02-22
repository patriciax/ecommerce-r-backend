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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizeController = void 0;
const size_schema_1 = require("../models/size.schema");
const apiFeatures_1 = require("../utils/apiFeatures");
class SizeController {
    constructor() {
        this.validateForm = (req) => {
            const errors = [];
            if (!req.body.title)
                errors.push('Nombre de la talla es requerido');
            if (!req.body.titleEnglish)
                errors.push('Nombre de la talla en inglés es requerido');
            return errors;
        };
        this.createSize = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = this.validateForm(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                const size = yield size_schema_1.Size.create({
                    name: req.body.title,
                    englishName: req.body.titleEnglish
                });
                return res.status(201).json({
                    status: 'success',
                    data: size
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.sizes = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const features = new apiFeatures_1.APIFeatures(size_schema_1.Size.find(), req.query).paginate();
                const sizes = yield features.query;
                const totalSizes = yield size_schema_1.Size.find();
                const totalPages = totalSizes.length / Number(((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: sizes.length,
                    data: {
                        sizes
                    }
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.updateSize = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = this.validateForm(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                const category = yield size_schema_1.Size.findById(req.params.id);
                if (!category)
                    return res.status(404).json({ status: 'fail', message: 'No size found with that ID' });
                const updatedSize = yield size_schema_1.Size.findByIdAndUpdate(req.params.id, {
                    name: req.body.title,
                    englishName: req.body.titleEnglish
                }, {
                    new: true,
                    runValidators: true
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        updatedSize
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
        this.deleteSize = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const size = yield size_schema_1.Size.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
                if (!size)
                    return res.status(404).json({ status: 'fail', message: 'No size found with that ID' });
                return res.status(204).json({
                    status: 'success',
                    data: null
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No size found with that ID'
                });
            }
        });
        this.getSize = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const size = yield size_schema_1.Size.findById(req.params.id);
                if (!size)
                    return res.status(404).json({ status: 'fail', message: 'No size found with that ID' });
                return res.status(200).json({
                    status: 'success',
                    data: size
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No size found with that ID'
                });
            }
        });
    }
}
exports.SizeController = SizeController;
