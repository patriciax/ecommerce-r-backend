import { Schema, model } from "mongoose";

const paymentSchema = new Schema({
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
    identification:{
        type: String
    },
    transactionId:{
        type:String
    },
    type:{
        type:String,
        enum:['card','paypal','appelpay', 'zelle', 'mercantil', 'banesco', 'giftCard', 'pagoMovil', "mercantil"],
    },
    total: {
        type: Number
    },
    bank: {
        type: String
    },
    purchaseType:{
        type:String,
        enum:['invoice','giftCard'],
    },
    taxAmount:{
        type: Object
    },
    carrierRate: {
        type: Object,
    },
    carrierRateAmount: {
        type: Number
    },
    zelleEmail: {
        type: String
    },
    status:{
        type:String,
        enum:['pending','approved','rejected'],
    },
    created:{
        type: Date,
        default: Date.now
    }   

})

export const Payment = model('Payment', paymentSchema);