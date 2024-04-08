import { Router } from "express";
import { ProductController } from "../controllers/productController";
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
const productController = new ProductController();

router.delete('/:id/secondary-image/:imageId', authMiddleware, productController.deleteSecondaryImage)
router.delete('/:id', authMiddleware, productController.deleteProduct)
router.post('/', authMiddleware, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: maxImagesCount }]), productController.createProduct)
router.patch('/:id', authMiddleware, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: maxImagesCount }]), productController.updateProduct)

router.get('/product-home', productController.productInHome)

router.get('/product-on-sale', productController.dailySaleProducts)
router.post('/product-search', productController.searchProducts)
router.get('/category/:categoryId', productController.productsByCategory)

router.get('/', productController.products)
router.get('/:id', productController.getProduct)

export default router;