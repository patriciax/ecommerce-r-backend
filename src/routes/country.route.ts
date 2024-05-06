import { Router } from "express";
import { CountryController } from "../controllers/countryController";

const router = Router();
const countryController = new CountryController();

router.get('/',  countryController.countries)

export default router;