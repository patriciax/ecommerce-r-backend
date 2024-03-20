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
    shippingService:{
        type:String,  
    },
    payment:{
        type: Schema.Types.ObjectId,
        ref: "Payment"
    },
    created:{
        type: Date,
        default: Date.now
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

invoiceSchema.virtual('invoiceProduct', {
    ref: 'InvoiceProduct',
    localField: '_id',
    foreignField: 'invoice'
})

export const Invoice = model('Invoice', invoiceSchema);