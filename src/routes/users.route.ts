import { Router } from "express";
import { LoginController } from "../controllers/loginController";
import {RegisterController} from "../controllers/registerController";
import { registerValidator } from "../validators/register.validator";
import { PasswordRestoreController } from "../controllers/passwordRestoreController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/userController";

const router = Router();
const loginController = new LoginController();  
const registerController = new RegisterController();
const passwordRestoreController = new PasswordRestoreController();
const userController = new UserController();

router.post('/login', loginController.login)
router.get('/user-info', authMiddleware, userController.getUserInfo)
router.post('/register', registerValidator, registerController.signup)
router.post('/resend-email-otp', registerController.resendEmailOtp)
router.post('/verify-email-otp', registerController.verifyEmailOtp)

router.post('/restore-pass/otp', passwordRestoreController.setRestorePasswordOtp)
router.post('/restore-pass/verify-otp', passwordRestoreController.verifyPasswordOtp)
router.patch('/restore-pass/update-password', passwordRestoreController.updatePassword)

router.patch('/update-profile', authMiddleware, userController.updateProfile)

export default router;