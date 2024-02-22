import { Router } from "express";
import { NewsletterController } from "../controllers/newsletterController";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";

const router = Router();
const newsletterController = new NewsletterController();

router.post('/', authMiddleware, restrictsTo(['NEWSLETTER-CREATE']), newsletterController.createNewsletter)
router.get('/', authMiddleware, restrictsTo(['NEWSLETTER-LIST']),  newsletterController.newsletters)

export default router;