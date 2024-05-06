import { Schema, model } from "mongoose";

const countrySchema = new Schema({
    name: {
        type: String,
    },
    value: {
        type: String,
    },
    states: [String],
    statesValues: [String]  
})

export const Country = model('Country', countrySchema);