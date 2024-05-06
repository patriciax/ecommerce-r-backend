"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favorite = void 0;
const mongoose_1 = require("mongoose");
const FavoriteSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
exports.Favorite = (0, mongoose_1.model)('Favorite', FavoriteSchema);
