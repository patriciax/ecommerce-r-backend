import {Schema, model} from 'mongoose'

const ProductSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    stock: {
        type: Number,
        default: 1
    },
    mainImage: {
        type: String
    },
    images: [String],
    createdAt:{
        type: Date,
        default: Date.now
    }

})

export const Product = model('Product', ProductSchema)
