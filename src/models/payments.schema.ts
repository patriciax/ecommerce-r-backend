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
    transactionId:{
        type:String
    },
    type:{
        type:String,
        enum:['card','paypal','appelpay', 'zelle', 'mercantil', 'banesco', 'giftCard'],
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