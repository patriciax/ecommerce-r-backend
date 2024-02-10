import { Router } from "express";
import { CategoryController } from "../controllers/categoryController";
import { authMiddleware } from "../middlewares/auth.middleware";
import multer from "multer";
import { maxImagesCount } from "../utils/maxImagesCount";

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: (_req, file, cb) => {
        const ext = file.mimetype.split('/')[1]
        cb(null, `${Date.now()}.${ext}`)
    },
})

const upload = multer({storage: storage})

const router = Router();
const categoryController = new CategoryController();

router.post('/', authMiddleware, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: maxImagesCount }]), categoryController.createCategory)
router.delete('/:id', authMiddleware,  categoryController.deleteCategory)

router.get('/', authMiddleware, categoryController.categories)
router.get('/:id', categoryController.getCategory)
router.patch('/:id', categoryController.updateCategory)

export default router;