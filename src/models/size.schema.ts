import {Query, Schema, model} from 'mongoose'

const SizeSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    englishName:{
        type: String,
        require: true
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

SizeSchema.pre<Query<any, any>>(/^find/, function(next){
    this.find({deletedAt: null})
    next()
})


export const Size = model('Size', SizeSchema)
