import { Schema, model } from "mongoose";

const allTimePayment = new Schema({
    amount: {
        type: Number
    }
})

export const AllTimePayment = model('AllTimePayment', allTimePayment)