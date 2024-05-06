"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zelle = void 0;
const mongoose_1 = require("mongoose");
const ZelleSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true
    },
});
exports.Zelle = (0, mongoose_1.model)('Zelle', ZelleSchema);
