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
exports.sanitizeCart = void 0;
const cart_schema_1 = require("../models/cart.schema");
const sanitizeCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartToDelete = [];
        const cart = yield cart_schema_1.Cart.find({ user: req.user._id }).populate('product').lean();
        cart.forEach((product) => {
            if (!product.product)
                cartToDelete.push(product._id);
        });
        yield cart_schema_1.Cart.deleteMany({ _id: { $in: cartToDelete } });
        let carts = cart.map((product) => {
            if (product.product)
                return Object.assign(Object.assign({}, product), { quantity: product.quantity > product.product.stock ? product.product.stock : product.quantity });
        });
        for (let cart of carts) {
            if (cart)
                yield cart_schema_1.Cart.findByIdAndUpdate(cart._id, { quantity: cart.quantity });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'fail',
            message: 'SOMETHING_WENT_WRONG'
        });
    }
    next();
});
exports.sanitizeCart = sanitizeCart;
