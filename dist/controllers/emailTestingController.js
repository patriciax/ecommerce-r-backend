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
exports.emailTestingController = void 0;
const emailController_1 = require("./emailController");
class emailTestingController {
    constructor() {
        this.email = "";
        this.sendCreditCardBalance = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            emailController.sendEmail("creditCardBalance", this.email, "Balance de GiftCard ERoca", {
                "cardNumber": "5793489526063202",
                "cardPin": "4102",
                "credits": "145.24"
            });
            return res.status(200).json({});
        });
        this.sendEmailPasswordReset = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            emailController.sendEmail("emailPasswordReset", this.email, "Password reset", {
                name: "Patricia Alvarez",
                emailOtp: "123456"
            });
            return res.status(200).json({});
        });
        this.sendEmailVerify = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            emailController.sendEmail("emailVerify", this.email, "Email verification", {
                "name": "Patricia",
                "emailOtp": "123456"
            });
            return res.status(200).json({});
        });
        this.sendGiftCard = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            emailController.sendEmail("giftCard", this.email, "Gift card recibida", {
                cardNumber: "5793489526063202",
                cardPin: "4102",
                message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            });
            return res.status(200).json({});
        });
        this.sendNewsletterHandlebars = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            emailController.sendEmail("newsletter", this.email, "Algún titulo de newsletter", {
                title: "Algún titulo de newsletter",
                name: `Patricia Alvarez`,
                description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            });
            return res.status(200).json({});
        });
        this.sendShipTracking = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            emailController.sendEmail("shipTracking", this.email, "Tracking de envío", {
                "invoiceNumber": "15664466757657",
                "tracking": "123456789102231232"
            });
            return res.status(200).json({});
        });
        this.sendRejectedPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            emailController.sendEmail("rejectedPayment", this.email, "Pago rechazado", {
                "reference": "123456789102231232"
            });
            return res.status(200).json({});
        });
        this.sendAdminNewRegister = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            emailController.sendEmail("adminNewRegister", this.email, "Nuevo cliente registrado", {
                name: `Patricia Alvarez`,
                email: this.email,
                phone: "584121081638"
            });
            return res.status(200).json({});
        });
        this.sendInvoice = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            const carts = [
                {
                    productModel: "Franela 1",
                    colorModel: "Azul",
                    sizeModel: "L",
                    quantity: 2
                },
                {
                    productModel: "Franela 2",
                    colorModel: "Amarillo",
                    sizeModel: "M",
                    quantity: 4
                },
                {
                    productModel: "Franela 3",
                    colorModel: "Verde",
                    sizeModel: "S",
                    quantity: 1
                },
                {
                    productModel: "Franela 4",
                    colorModel: "Rojo",
                    sizeModel: "XL",
                    quantity: 1
                },
                {
                    productModel: "Franela 5",
                    colorModel: "Blanco",
                    sizeModel: "XXL",
                    quantity: 3
                }
            ];
            emailController.sendEmail("invoice", this.email, "Factura ERoca", {
                "invoiceNumber": "123456789102231232",
                "user": "Patricia Alvarez",
                "carts": carts,
                "trackingNumber": "123456789102231232"
            });
            return res.status(200).json({});
        });
        this.email = "rodriguezwillian95@gmail.com";
    }
}
exports.emailTestingController = emailTestingController;
