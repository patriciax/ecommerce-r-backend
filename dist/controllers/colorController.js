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
exports.ColorController = void 0;
const color_schema_1 = require("../models/color.schema");
const apiFeatures_1 = require("../utils/apiFeatures");
class ColorController {
    constructor() {
        this.validateForm = (req) => {
            const errors = [];
            if (!req.body.title)
                errors.push('Nombre del color es requerido');
            if (!req.body.titleEnglish)
                errors.push('Nombre del color en inglés es requerido');
            if (!req.body.hexColor)
                errors.push('Color es requerido');
            return errors;
        };
        this.createColor = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = this.validateForm(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                const color = yield color_schema_1.Color.create({
                    name: req.body.title,
                    englishName: req.body.titleEnglish,
                    hex: req.body.hexColor
                });
                return res.status(201).json({
                    status: 'success',
                    data: color
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.colors = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const features = new apiFeatures_1.APIFeatures(color_schema_1.Color.find(), req.query).paginate();
                const colors = yield features.query;
                const totalColors = yield color_schema_1.Color.find();
                const totalPages = totalColors.length / Number(((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: colors.length,
                    data: {
                        colors
                    }
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.updateColor = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = this.validateForm(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                const color = yield color_schema_1.Color.findById(req.params.id);
                if (!color)
                    return res.status(404).json({ status: 'fail', message: 'No color found with that ID' });
                const updatedColor = yield color_schema_1.Color.findByIdAndUpdate(req.params.id, {
                    name: req.body.title,
                    englishName: req.body.titleEnglish,
                    hex: req.body.hexColor
                }, {
                    new: true,
                    runValidators: true
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        updatedColor
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
        this.deleteColor = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const color = yield color_schema_1.Color.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
                if (!color)
                    return res.status(404).json({ status: 'fail', message: 'No color found with that ID' });
                return res.status(204).json({
                    status: 'success',
                    data: null
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No color found with that ID'
                });
            }
        });
        this.getColor = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const size = yield color_schema_1.Color.findById(req.params.id);
                if (!size)
                    return res.status(404).json({ status: 'fail', message: 'No color found with that ID' });
                return res.status(200).json({
                    status: 'success',
                    data: size
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No color found with that ID'
                });
            }
        });
    }
}
exports.ColorController = ColorController;
