import { Schema, model } from "mongoose";

const invoiceSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },    
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    transactionOrder:{
        type:String
    },
    shippingTracking:{
        type:String
    },
    payment:{
        type: Schema.Types.ObjectId,
        ref: "Payment"
    },
    products: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            {
                type: Number
            }
        ]
    }   

})

export const Invoice = model('Invoice', invoiceSchema);