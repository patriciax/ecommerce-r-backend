import {Model, Query, Schema, model} from 'mongoose'
import { Size } from './size.schema'
import { Color } from './color.schema'
import { Category } from './category.schema'

const ProductSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    nameEnglish: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    descriptionEnglish: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    priceDiscount: {
        type: Number,
        default: 0
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
    categories: [
        {type: Schema.Types.ObjectId, ref: Category}
    ],
    images: [String],
    slug: {
        type: String,
        unique: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    deletedAt:{
        type: Date,
        default: null
    }

})

interface ProductModel extends Model<any, any> {
    slug: string;
}

ProductSchema.pre<Query<any, any>>(/^find/, function(next){
    this.find({deletedAt: null})
    next()
})

export const Product = model('Product', ProductSchema)
