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
exports.FavoriteController = void 0;
const product_schema_1 = require("../models/product.schema");
const favorite_schema_1 = require("../models/favorite.schema");
class FavoriteController {
    constructor() {
        this.storeFavorite = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield product_schema_1.Product.findById(req.body.productId);
                if (!product)
                    return res.status(404).json({ status: 'fail', message: 'PRODUCT_NOT_FOUND' });
                const favoriteFound = yield favorite_schema_1.Favorite.findOne({
                    user: req.user._id,
                    product: req.body.productId
                });
                if (favoriteFound) {
                    yield favorite_schema_1.Favorite.findByIdAndDelete(favoriteFound._id);
                    return res.status(201).json({
                        status: 'success',
                        message: 'FAVORITE_REMOVED',
                    });
                }
                const favorite = yield favorite_schema_1.Favorite.create({
                    user: req.user._id,
                    product: req.body.productId
                });
                return res.status(201).json({
                    status: 'success',
                    message: 'FAVORITE_ADDED_SUCCESSFULLY',
                    data: favorite
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.deleteFavorite = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const favorite = yield favorite_schema_1.Favorite.findById(req.params.favoriteId);
                if (!favorite)
                    return res.status(404).json({ status: 'fail', message: 'No favorite found with that ID' });
                yield favorite_schema_1.Favorite.findByIdAndDelete(req.params.favoriteId);
                return res.status(201).json({
                    status: 'success',
                    message: 'FAVORITE_REMOVED',
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.getFavorites = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const favorites = yield favorite_schema_1.Favorite.find({ user: req.user._id }).populate('product');
                if (!favorites)
                    return res.status(404).json({ status: 'fail', message: 'No favorites found' });
                return res.status(200).json({
                    status: 'success',
                    data: favorites
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
exports.FavoriteController = FavoriteController;
