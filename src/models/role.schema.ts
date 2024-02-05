import { Schema, model } from "mongoose";

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    permissions: {
        type: [String]
    }
})

export const Role = model('Role', roleSchema)