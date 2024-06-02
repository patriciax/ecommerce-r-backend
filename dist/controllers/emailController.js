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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const nodemailer_1 = require("nodemailer");
const nodemailer_express_handlebars_1 = __importDefault(require("nodemailer-express-handlebars"));
const path_1 = require("path");
class EmailController {
    constructor() {
        this.transporter = null;
        this.sendEmail = (template, receiver, subject, context, attachments = []) => __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                template: template,
                to: receiver.toString(), // Convertir el tipo 'String' a 'string'
                subject: subject,
                context: context,
                attachments
            };
            if (this.transporter) {
                const result = yield this.transporter.sendMail(mailOptions);
                console.log("result", result);
            }
        });
        this.transporter = (0, nodemailer_1.createTransport)({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '0'),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log("this.transporter", this.transporter);
        const handlebarOptions = {
            viewEngine: {
                extName: '.hbs',
                layoutsDir: (0, path_1.resolve)('./src/mail/templates'),
            },
            viewPath: (0, path_1.resolve)('./src/mail/templates/'),
        };
        this.transporter.use('compile', (0, nodemailer_express_handlebars_1.default)(handlebarOptions));
    }
}
exports.EmailController = EmailController;
