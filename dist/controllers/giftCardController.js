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
exports.GiftCardController = void 0;
const giftCard_schema_1 = require("../models/giftCard.schema");
const apiFeatures_1 = require("../utils/apiFeatures");
class GiftCardController {
    constructor() {
        this.validateForm = (req) => {
            const errors = [];
            if (!req.body.title)
                errors.push('Nombre del gift card es requerido');
            if (!req.body.titleEnglish)
                errors.push('Nombre del gift card en inglés es requerido');
            if (!req.body.amount)
                errors.push('Precio es requerido');
            return errors;
        };
        this.createGiftCard = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = this.validateForm(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                const giftCard = yield giftCard_schema_1.GiftCard.create({
                    name: req.body.title,
                    englishName: req.body.titleEnglish,
                    amount: req.body.amount
                });
                return res.status(201).json({
                    status: 'success',
                    data: giftCard
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.giftCards = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const features = new apiFeatures_1.APIFeatures(giftCard_schema_1.GiftCard.find(), req.query).paginate();
                const giftCards = yield features.query;
                const totalGiftCards = yield giftCard_schema_1.GiftCard.find();
                const totalPages = totalGiftCards.length / Number(((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: giftCards.length,
                    data: {
                        giftCards
                    }
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.updateGiftCard = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = this.validateForm(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                const giftCard = yield giftCard_schema_1.GiftCard.findById(req.params.id);
                if (!giftCard)
                    return res.status(404).json({ status: 'fail', message: 'No gift card found with that ID' });
                const updatedGiftCard = yield giftCard_schema_1.GiftCard.findByIdAndUpdate(req.params.id, {
                    name: req.body.title,
                    englishName: req.body.titleEnglish,
                    amount: req.body.amount
                }, {
                    new: true,
                    runValidators: true
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        updatedGiftCard
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
        this.deleteGiftCard = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const giftCard = yield giftCard_schema_1.GiftCard.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
                if (!giftCard)
                    return res.status(404).json({ status: 'fail', message: 'No gift card found with that ID' });
                return res.status(204).json({
                    status: 'success',
                    data: null
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No gift card found with that ID'
                });
            }
        });
        this.getGiftCard = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const giftCard = yield giftCard_schema_1.GiftCard.findById(req.params.id);
                if (!giftCard)
                    return res.status(404).json({ status: 'fail', message: 'No gift card found with that ID' });
                return res.status(200).json({
                    status: 'success',
                    data: giftCard
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No gift card found with that ID'
                });
            }
        });
    }
}
exports.GiftCardController = GiftCardController;
