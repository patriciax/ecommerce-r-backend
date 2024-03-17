import { Schema, model } from "mongoose";

const invoiceProductSchema = new Schema({
    invoice: {
        type: Schema.Types.ObjectId,
        ref: "Invoice"
    },    
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        default: 1
    }        
})

export const InvoiceProduct = model('InvoiceProduct', invoiceProductSchema);