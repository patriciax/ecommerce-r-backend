import {Query, Schema, model} from 'mongoose'

const FavoriteSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }, 
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

export const Favorite = model('Favorite', FavoriteSchema)