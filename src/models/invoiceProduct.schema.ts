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
    },
    price: {
        type: Number
    }        
})

invoiceProductSchema.pre(/^find/, function(this: any, next){
    this.populate('product').populate('size').populate('color');
    next();
})

export const InvoiceProduct = model('InvoiceProduct', invoiceProductSchema);