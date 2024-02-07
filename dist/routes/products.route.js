"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const maxImagesCount_1 = require("../utils/maxImagesCount");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: (_req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `${Date.now()}.${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
const router = (0, express_1.Router)();
const productController = new productController_1.ProductController();
router.delete('/:id/secondary-image', auth_middleware_1.authMiddleware, productController.deleteSecondaryImage);
router.delete('/:id', auth_middleware_1.authMiddleware, productController.deleteProduct);
router.post('/', auth_middleware_1.authMiddleware, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: maxImagesCount_1.maxImagesCount }]), productController.createProduct);
router.patch('/:id', auth_middleware_1.authMiddleware, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: maxImagesCount_1.maxImagesCount }]), productController.updateProduct);
router.get('/', auth_middleware_1.authMiddleware, productController.products);
router.get('/:id', productController.getProduct);
exports.default = router;
