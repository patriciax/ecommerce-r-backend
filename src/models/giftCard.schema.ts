import { string } from '@hapi/joi'
import {Query, Schema, model} from 'mongoose'

const GiftCardSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    englishName:{
        type: String,
        require: true
    },
    amount: {
        type: String,
        require: true,
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

GiftCardSchema.pre<Query<any, any>>(/^find/, function(next){
    this.find({deletedAt: null})
    next()
})


export const GiftCard = model('GiftCard', GiftCardSchema)