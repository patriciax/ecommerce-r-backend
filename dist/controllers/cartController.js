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
exports.CartController = void 0;
const cart_schema_1 = require("../models/cart.schema");
class CartController {
    constructor() {
        this.validateInput = (req) => {
            const errors = [];
            if (!req.body.productId)
                errors.push('PRODUCT_ID_IS_REQUIRED');
            if (!req.body.quantity)
                errors.push('QUANTITY_IS_REQUIRED');
            return errors;
        };
        this.addProductToCart = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const results = this.validateInput(req);
            if (results.length > 0)
                return res.status(422).json({ status: 'fail', message: results });
            try {
                cart_schema_1.Cart.create({
                    user: req.user._id,
                    product: req.body.productId,
                    quantity: req.body.quantity,
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        message: 'PRODUCT_ADDED_TO_CART'
                    }
                });
            }
            catch (err) {
                return res.status(500).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.updateProductToCart = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const results = this.validateInput(req);
            if (results.length > 0)
                return res.status(422).json({ status: 'fail', message: results });
            try {
                const cart = yield cart_schema_1.Cart.findOne({ user: req.user._id, product: req.body.productId });
                if (!cart)
                    return res.status(404).json({
                        status: 'fail',
                        message: 'PRODUCT_NOT_FOUND_IN_CART'
                    });
                cart.quantity = req.body.quantity;
                cart.save();
                return res.status(200).json({
                    status: 'success',
                    data: {
                        message: 'PRODUCT_UPDATED_IN_CART'
                    }
                });
            }
            catch (err) {
                return res.status(500).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.deleteProductFromCart = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                cart_schema_1.Cart.findByIdAndDelete(req.params.id);
                return res.status(200).json({
                    status: 'success',
                    data: {
                        message: 'PRODUCT_DELETED_FROM_CART'
                    }
                });
            }
            catch (err) {
                return res.status(500).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
    }
}
exports.CartController = CartController;
