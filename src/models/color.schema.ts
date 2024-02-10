import {Query, Schema, model} from 'mongoose'

const ColorSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    hex: {
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

ColorSchema.pre<Query<any, any>>(/^find/, function(next){
    this.find({deletedAt: null})
    next()
})


export const Color = model('Color', ColorSchema)