import { Schema, model } from "mongoose";

const allTimePurchase = new Schema({
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product"
        },
        size: {
            type: Schema.Types.ObjectId,
            ref: "Size"
        },
        color: {
            type: Schema.Types.ObjectId,
            ref: "Color"
        },
        amount: {
            type: Number,
            default: 1
        }  
    
})

export const AllTimePurchase = model('AllTimePurchase', allTimePurchase)