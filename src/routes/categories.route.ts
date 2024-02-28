import { Router } from "express";
import { CategoryController } from "../controllers/categoryController";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";
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

router.post('/', authMiddleware, restrictsTo(['CATEGORY-CREATE']),  upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: maxImagesCount }]), categoryController.createCategory)
router.delete('/:id', authMiddleware, restrictsTo(['CATEGORY-DELETE']),  categoryController.deleteCategory)

router.get('/menu', categoryController.menuCategories)
router.get('/', categoryController.categories)
router.get('/:id', categoryController.getCategory)
router.patch('/:id', authMiddleware, restrictsTo(['CATEGORY-UPDATE']), categoryController.updateCategory)

export default router;