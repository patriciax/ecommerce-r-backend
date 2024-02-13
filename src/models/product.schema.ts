import {Query, Schema, model} from 'mongoose'
import { Size } from './size.schema'
import { Color } from './color.schema'
import { Category } from './category.schema'

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
    sizes: [
        {type: Schema.Types.ObjectId, ref: Size}
    ],
    colors: [
        {type: Schema.Types.ObjectId, ref: Color}
    ],
    category: {type: Schema.Types.ObjectId, ref: Category},
    images: [String],
    createdAt:{
        type: Date,
        default: Date.now
    },
    deletedAt:{
        type: Date,
        default: null
    }

})

ProductSchema.pre<Query<any, any>>(/^find/, function(next){
    this.find({deletedAt: null})
    next()
})

export const Product = model('Product', ProductSchema)
