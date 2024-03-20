import { Schema, model } from "mongoose";

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },    
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
    quantity: {
        type: Number,
        default: 1
    }        
})

export const Cart = model('Cart', cartSchema);