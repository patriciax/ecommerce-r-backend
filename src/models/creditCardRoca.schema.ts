import { Schema, model } from "mongoose";

const creditCardRoca = new Schema({
    cardNumber: {
        type: String,
        required: true
    },
    cardPin:{
        type: String,
        required: true
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    credit: {
        type: Number,
        required: true
    },
    otp: {
        type: Number,
    }
})

export const CreditCardRoca = model('CreditCardRoca', creditCardRoca)