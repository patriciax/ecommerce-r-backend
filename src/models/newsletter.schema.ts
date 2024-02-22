import { Schema, model } from "mongoose";

const newsletter = new Schema({
    "title":{
        type: String,
        required: true
    },
    "description":{
        type: String,
        required: true
    },
    "sent":{
        type: Boolean,
        default: false
    }
})

export const Newsletter = model("Newsletter", newsletter);