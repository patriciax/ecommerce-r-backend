import { Router } from "express";
import { LoginController } from "../controllers/loginController";
import {RegisterController} from "../controllers/registerController";
import { registerValidator } from "../validators/register.validator";
import { PasswordRestoreController } from "../controllers/passwordRestoreController";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/userController";

const router = Router();
const loginController = new LoginController();  
const registerController = new RegisterController();
const passwordRestoreController = new PasswordRestoreController();
const userController = new UserController();

router.post('/login', loginController.login)
router.get('/user-info', authMiddleware, userController.getUserInfo)
router.post('/register', registerController.signup)
router.post('/resend-email-otp', registerController.resendEmailOtp)
router.post('/verify-email-otp', registerController.verifyEmailOtp)
router.post('/verify-repeated-email', userController.verifyRepeatedEmail)

router.post('/restore-pass/otp', passwordRestoreController.setRestorePasswordOtp)
router.post('/restore-pass/verify-otp', passwordRestoreController.verifyPasswordOtp)
router.patch('/restore-pass/update-password', passwordRestoreController.updatePassword)

router.patch('/update-profile', authMiddleware, userController.updateProfile)

router.post('/employee', authMiddleware, restrictsTo(['EMPLOYEE-CREATE']), userController.createEmployee)
router.get('/employee', authMiddleware, restrictsTo(['EMPLOYEE-LIST']), userController.employees)
router.get('/employee/:id', authMiddleware, restrictsTo(['EMPLOYEE-LIST']), userController.employee)
router.delete('/employee/:id', authMiddleware, restrictsTo(['EMPLOYEE-DELETE']), userController.deleteEmployee)
router.patch('/employee/:id', authMiddleware, userController.updateEmployee)

export default router;