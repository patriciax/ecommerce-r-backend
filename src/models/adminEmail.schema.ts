import { Schema, model } from "mongoose";

const adminEmail = new Schema({
    email: {
        type: String,
        required: true
    }
})

export const AdminEmail = model('AdminEmail', adminEmail)