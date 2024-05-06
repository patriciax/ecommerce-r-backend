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
    zelleEmail: {
        type: String
    },
    pagoMovilReference: {
        type: String
    },
    pagoMovilDate: {
        type: Date
    },
    carrier:{
        type: Object
    },
    purchaseType: {
        type: String,
        enum:['invoice','giftCard'],
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