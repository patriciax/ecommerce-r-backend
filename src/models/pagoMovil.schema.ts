import {Schema, model} from 'mongoose'

const PagoMovilSchema = new Schema({
    phone: {
        type:String,
        required: true
    },
    bank:{
        type: String,
        required: true
    },
    identification: {
        type: String,
        required: true
    }
})

export const PagoMovil = model('PagoMovil', PagoMovilSchema)