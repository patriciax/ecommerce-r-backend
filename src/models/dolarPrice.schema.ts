import { Schema, model } from "mongoose";

const dolarPrice = new Schema({
    price: {
        type: Number,
        required: true
    },
    updatedAt:{
        type: Date,
        required: true,
        default: Date.now
    }
})

export const DolarPrice = model('DolarPrice', dolarPrice);