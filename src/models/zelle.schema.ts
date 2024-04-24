import {Schema, model} from 'mongoose'

const ZelleSchema = new Schema({
    email: {
        type:String,
        required: true
    },
})

export const Zelle = model('Zelle', ZelleSchema)