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
const product_schema_1 = require("../models/product.schema");
class CartController {
    constructor() {
        this.validateInput = (req) => __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            if (!req.body.productId)
                errors.push('PRODUCT_ID_IS_REQUIRED');
            if (!req.body.quantity)
                errors.push('QUANTITY_IS_REQUIRED');
            const product = yield product_schema_1.Product.findById(req.body.productId);
            if (!product)
                errors.push('PRODUCT_NOT_FOUND');
            if (product && req.body.quantity > product.stock)
                errors.push('QUANTITY_EXCEEDS_STOCK');
            return errors;
        });
        this.addProductToCart = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.validateInput(req);
                if (results.length > 0)
                    return res.status(422).json({ status: 'fail', message: results });
                const carts = yield cart_schema_1.Cart.find({ user: req.user._id });
                if (carts.length > 0) {
                    const product = carts.find((product) => product.product._id == req.body.productId);
                    if (product) {
                        product.quantity += req.body.quantity;
                        product.save();
                        return res.status(200).json({
                            status: 'success',
                            data: {
                                message: 'PRODUCT_ADDED_TO_CART'
                            }
                        });
                    }
                }
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
            try {
                const results = yield this.validateInput(req);
                if (results.length > 0)
                    return res.status(422).json({ status: 'fail', message: results });
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
                const cart = yield cart_schema_1.Cart.findByIdAndDelete(req.params.id);
                if (!cart) {
                    return res.status(404).json({
                        status: 'fail',
                        data: {
                            message: 'PRODUCT_NOT_FOUND_IN_CART'
                        }
                    });
                }
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
        this.massAssignment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield cart_schema_1.Cart.find({ user: req.user._id }).lean();
                const cartItems = [];
                for (const item of req.body.cartItems) {
                    const product = products.find((product) => product.product === item.productId);
                    let productDB = null;
                    try {
                        productDB = yield product_schema_1.Product.findById(item.productId);
                    }
                    catch (error) {
                        continue;
                    }
                    if (productDB === null)
                        continue;
                    let quantity = 0;
                    if (product) {
                        quantity = product.quantity + item.quantity;
                        if (quantity > productDB.stock)
                            quantity = productDB.stock;
                    }
                    else {
                        quantity = item.quantity;
                        if (quantity > productDB.stock)
                            quantity = productDB.stock;
                    }
                    cartItems.push({
                        user: req.user._id,
                        product: item.productId,
                        quantity: quantity
                    });
                }
                if (products.length === 0) {
                    yield cart_schema_1.Cart.insertMany(cartItems);
                }
                else {
                    for (const item of products) {
                        const product = cartItems.find((product) => product.product == (item === null || item === void 0 ? void 0 : item.product));
                        if (!product)
                            continue;
                        yield cart_schema_1.Cart.findByIdAndUpdate(item._id, { quantity: product.quantity });
                    }
                }
                return res.status(200).json({
                    status: 'success',
                    data: {
                        message: 'PRODUCT_ADDED_CART'
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
        this.productInfoGuest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield product_schema_1.Product.find({ _id: { $in: req.body.cartProducts.map((product) => product.productId) } }).lean();
                const produtsWithQuantity = products.map((product) => {
                    const cartProduct = req.body.cartProducts.find((cartProduct) => cartProduct.productId == product._id);
                    return Object.assign(Object.assign({}, product), { quantity: cartProduct.quantity > product.stock ? product.stock : cartProduct.quantity });
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        "cart": produtsWithQuantity
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
        this.productInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield cart_schema_1.Cart.find({ user: req.user._id }).populate('product').lean();
                const carts = products.map((product) => {
                    if (product.product)
                        return Object.assign(Object.assign({}, product.product), { quantity: product.quantity > product.product.stock ? product.product.stock : product.quantity });
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        "cart": products
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
