import { InferSchemaType, Query, Schema, model } from "mongoose";
import bcrypt from 'bcrypt'
import { Role } from "./role.schema";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    lastname:{
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
    },
    address:{
        type: String
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    emailOtp:{
        type: String,
        select: false
    },
    emailVerifiedAt:{
        type: Date,
        select: false
    },  
    passwordResetOtp:{
        type: String,
        select: false
    },
    role: { type: Schema.Types.ObjectId, ref: Role },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    deletedAt:{
        type: Date,
        default: null
    }
})

UserSchema.pre('save', async function(next){
    if(this.password && this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

UserSchema.pre<Query<any, any>>(/^find/, function(next){
    this.find({deletedAt: null})
    next()
})

UserSchema.methods.verifyUserPassword = async function(password:string){
    return await bcrypt.compare(password, this.password)
}

declare interface IUser extends InferSchemaType<typeof UserSchema> {
    verifyUserPassword(password: string): Promise<boolean>
}

export const User = model<IUser>('User', UserSchema)