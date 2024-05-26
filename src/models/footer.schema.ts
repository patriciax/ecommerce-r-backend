import { string } from '@hapi/joi'
import {Query, Schema, model} from 'mongoose'

const FooterSchema = new Schema({
    title: {
        type: String,
        require: true,
    },
    titleEnglish: {
        type: String,
        require: true,
    },
    description:{
        type: String,
        require: true
    },
    descriptionEnglish: {
        type: String,
        require: true,
    },
    section: {
        type: String,
        require: true,
    },
    slug:{
        type: String,
        require: true,
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

export const Footer = model('Footer', FooterSchema)