import { Schema, model } from "mongoose";

const countrySchema = new Schema({
    name: {
        type: String,
    },
    states: [String]  
})

export const Country = model('Country', countrySchema);