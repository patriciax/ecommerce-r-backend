import {Query, Schema, model} from 'mongoose'

const CategorySchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    englishName:{
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    categoryType: {
        type: String,
        enum: ['main', 'sub', 'final'],
        default: 'main'
    },
    slug:{
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

CategorySchema.pre<Query<any, any>>(/^find/, function(next){
    this.find({deletedAt: null})
    next()
})


export const Category = model('Category', CategorySchema)
