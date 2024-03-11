import { Schema, model } from "mongoose";

const BannerSchema = new Schema({
    type: {
        type: String,
        enum: ["image", "video"],
        default: "image"
    },
    secondaryTexts: {
        type: [String],
    },
    mainTexts: {
        type: [String],
    },
    video: {
        type: String
    },
    images: {
        type: [String],
    }
})

export const Banner = model("Banner", BannerSchema)