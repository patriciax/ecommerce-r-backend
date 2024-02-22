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
exports.NewsletterController = void 0;
const apiFeatures_1 = require("../utils/apiFeatures");
const newsletter_schema_1 = require("../models/newsletter.schema");
const user_schema_1 = require("../models/user.schema");
const emailController_1 = require("./emailController");
const role_schema_1 = require("../models/role.schema");
class NewsletterController {
    constructor() {
        this.validateForm = (req) => {
            const errors = [];
            if (!req.body.title)
                errors.push('Nombre del color es requerido');
            if (!req.body.description)
                errors.push('Nombre del color en inglés es requerido');
            return errors;
        };
        this.createNewsletter = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = this.validateForm(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                const newsLetter = yield newsletter_schema_1.Newsletter.create({
                    title: req.body.title,
                    description: req.body.description
                });
                return res.status(201).json({
                    status: 'success',
                    data: newsLetter
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.newsletters = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const features = new apiFeatures_1.APIFeatures(newsletter_schema_1.Newsletter.find(), req.query).paginate();
                const newsletters = yield features.query;
                const totalNewsletter = yield newsletter_schema_1.Newsletter.find();
                const totalPages = totalNewsletter.length / Number(((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: newsletters.length,
                    data: {
                        newsletters
                    }
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.sendNewsletters = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const emailController = new emailController_1.EmailController();
                const role = yield role_schema_1.Role.findOne({ role: "CUSTOMER" });
                const users = yield user_schema_1.User.find({ role: role === null || role === void 0 ? void 0 : role._id });
                const newsletters = yield newsletter_schema_1.Newsletter.find({ sent: false });
                yield Promise.all(newsletters.map((newsletter) => __awaiter(this, void 0, void 0, function* () {
                    yield Promise.all(users.map((user) => __awaiter(this, void 0, void 0, function* () {
                        console.log(user.email, newsletter.title, newsletter.description);
                        emailController.sendEmail("newsletter", user.email, newsletter.title, {
                            title: newsletter.title,
                            name: `${user.name} ${user.lastname}`,
                            description: newsletter.description
                        });
                    })));
                    newsletter.sent = true;
                    yield newsletter.save();
                })));
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
exports.NewsletterController = NewsletterController;
