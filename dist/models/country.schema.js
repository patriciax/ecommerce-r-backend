"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Country = void 0;
const mongoose_1 = require("mongoose");
const countrySchema = new mongoose_1.Schema({
    name: {
        type: String,
    },
    value: {
        type: String,
    },
    states: [String],
    statesValues: [String]
});
exports.Country = (0, mongoose_1.model)('Country', countrySchema);
