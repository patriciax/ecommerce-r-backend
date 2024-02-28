"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
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
const categoryController = new categoryController_1.CategoryController();
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictsTo)(['CATEGORY-CREATE']), upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: maxImagesCount_1.maxImagesCount }]), categoryController.createCategory);
router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictsTo)(['CATEGORY-DELETE']), categoryController.deleteCategory);
router.get('/menu', categoryController.menuCategories);
router.get('/', categoryController.categories);
router.get('/:id', categoryController.getCategory);
router.patch('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictsTo)(['CATEGORY-UPDATE']), categoryController.updateCategory);
exports.default = router;
