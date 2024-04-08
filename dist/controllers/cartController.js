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
            var _a, _b;
            const errors = [];
            if (!req.body.productId)
                errors.push('PRODUCT_ID_IS_REQUIRED');
            if (!req.body.quantity)
                errors.push('QUANTITY_IS_REQUIRED');
            const product = yield product_schema_1.Product.findById(req.body.productId);
            if (!product)
                errors.push('PRODUCT_NOT_FOUND');
            const stock = (_b = (_a = product === null || product === void 0 ? void 0 : product.productVariations.find((item) => item.color[0]._id == req.body.color._id && item.size[0]._id == req.body.size._id)) === null || _a === void 0 ? void 0 : _a.stock) !== null && _b !== void 0 ? _b : 0;
            console.log(product === null || product === void 0 ? void 0 : product.productVariations.find((item) => item.color[0]._id == req.body.color._id && item.size[0]._id == req.body.size._id));
            if (product && req.body.quantity > stock)
                errors.push('QUANTITY_EXCEEDS_STOCK');
            return errors;
        });
        this.addProductToCart = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d;
            try {
                const results = yield this.validateInput(req);
                if (results.length > 0)
                    return res.status(422).json({ status: 'fail', message: results });
                const carts = yield cart_schema_1.Cart.find({ user: req.user._id });
                if (carts.length > 0) {
                    const product = carts.find((product) => product.product == req.body.productId && product.size == req.body.size._id && product.color == req.body.color._id);
                    if (product) {
                        const cartModel = yield cart_schema_1.Cart.findOne({ user: req.user._id, product: product.product, size: product.size, color: product.color });
                        const productModel = yield product_schema_1.Product.findById(product.product);
                        const productStock = (_d = (_c = productModel === null || productModel === void 0 ? void 0 : productModel.productVariations.find((item) => item.color[0]._id == req.body.color._id && item.size[0]._id == req.body.size._id)) === null || _c === void 0 ? void 0 : _c.stock) !== null && _d !== void 0 ? _d : 0;
                        if (productStock < (cartModel === null || cartModel === void 0 ? void 0 : cartModel.quantity) + req.body.quantity)
                            return res.status(422).json({ status: 'fail', message: 'QUANTITY_EXCEEDS_STOCK' });
                        if (cartModel) {
                            cartModel.quantity = cartModel.quantity + req.body.quantity;
                            yield cartModel.save();
                            return res.status(200).json({
                                status: 'success',
                                data: {
                                    message: 'PRODUCT_ADDED_TO_CART'
                                }
                            });
                        }
                    }
                }
                yield cart_schema_1.Cart.create({
                    user: req.user._id,
                    product: req.body.productId,
                    size: req.body.size,
                    color: req.body.color,
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
                const cart = yield cart_schema_1.Cart.findOne({ user: req.user._id, product: req.body.productId, size: req.body.size, color: req.body.color });
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
                const cart = yield cart_schema_1.Cart.findOne({ user: req.user._id, product: req.params.id });
                if (!cart) {
                    return res.status(404).json({
                        status: 'fail',
                        data: {
                            message: 'PRODUCT_NOT_FOUND_IN_CART'
                        }
                    });
                }
                yield cart_schema_1.Cart.findByIdAndDelete(cart._id);
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
                    const variation = productDB.productVariations.find((variation) => variation.color[0]._id == item.color && variation.size[0]._id == item.size);
                    if (product) {
                        quantity = product.quantity + item.quantity;
                        (variation === null || variation === void 0 ? void 0 : variation.stock) ? quantity > variation.stock ? quantity = variation.stock : quantity : 0;
                    }
                    else {
                        quantity = item.quantity;
                        (variation === null || variation === void 0 ? void 0 : variation.stock) ? quantity > variation.stock ? quantity = variation.stock : quantity : 0;
                    }
                    cartItems.push({
                        user: req.user._id,
                        product: item.productId,
                        size: item.size,
                        color: item.color,
                        quantity: quantity
                    });
                }
                if (products.length === 0) {
                    yield cart_schema_1.Cart.insertMany(cartItems);
                }
                else {
                    for (const item of products) {
                        const product = cartItems.find((product) => product.product != (item === null || item === void 0 ? void 0 : item.product));
                        if (product) {
                            yield cart_schema_1.Cart.create({
                                user: req.user._id,
                                product: product.product,
                                size: product.size,
                                color: product.color,
                                quantity: item.quantity,
                            });
                        }
                        else {
                            yield cart_schema_1.Cart.findByIdAndUpdate(item._id, { quantity: item.quantity });
                        }
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
                const products = yield product_schema_1.Product.find({ _id: { $in: req.body.cartProducts.map((product) => product.productId) } }).populate('productVariations.size').populate('productVariations.color').lean();
                const productsWithQuantity = [];
                req.body.cartProducts.forEach((cartProduct) => {
                    var _a;
                    const variationToAdd = (_a = products.find((product) => product._id == cartProduct.productId)) === null || _a === void 0 ? void 0 : _a.productVariations.find((variation) => { var _a, _b; return variation.color[0]._id == ((_a = cartProduct.color) === null || _a === void 0 ? void 0 : _a._id) && variation.size[0]._id == ((_b = cartProduct.size) === null || _b === void 0 ? void 0 : _b._id); });
                    productsWithQuantity.push(Object.assign(Object.assign({}, products.find((product) => product._id == cartProduct.productId)), { size: variationToAdd === null || variationToAdd === void 0 ? void 0 : variationToAdd.size[0], color: variationToAdd === null || variationToAdd === void 0 ? void 0 : variationToAdd.color[0], stock: variationToAdd === null || variationToAdd === void 0 ? void 0 : variationToAdd.stock, quantity: (variationToAdd === null || variationToAdd === void 0 ? void 0 : variationToAdd.stock) ? cartProduct.quantity > (variationToAdd === null || variationToAdd === void 0 ? void 0 : variationToAdd.stock) ? variationToAdd === null || variationToAdd === void 0 ? void 0 : variationToAdd.stock : cartProduct.quantity : 0 }));
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        "cart": productsWithQuantity
                    }
                });
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.productInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield cart_schema_1.Cart.find({ user: req.user._id }).populate('product').populate('size').populate('color').lean();
                const carts = products.map((product) => {
                    var _a;
                    const variationToAdd = product.product.productVariations.find((variation) => { var _a, _b; return variation.color[0].toString() == ((_a = product.color) === null || _a === void 0 ? void 0 : _a._id.toString()) && variation.size[0].toString() == ((_b = product.size) === null || _b === void 0 ? void 0 : _b._id.toString()); });
                    if (product.product)
                        return Object.assign(Object.assign({}, product.product), { size: product.size, color: product.color, stock: (_a = variationToAdd === null || variationToAdd === void 0 ? void 0 : variationToAdd.stock) !== null && _a !== void 0 ? _a : 0, quantity: product.quantity > (variationToAdd === null || variationToAdd === void 0 ? void 0 : variationToAdd.stock) ? variationToAdd === null || variationToAdd === void 0 ? void 0 : variationToAdd.stock : product.quantity });
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        "cart": carts
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
