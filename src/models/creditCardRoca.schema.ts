import { InferSchemaType, Model, Schema, model } from "mongoose";
import bcrypt from 'bcrypt'

interface CreditCardRocaDocument extends Document {
    // Definir las propiedades del documento
    cardNumber: string;
    cardPin: number;
    user: Schema.Types.ObjectId;
    credit: number;
    otp: number;
}

const CreditCardRocaSchema = new Schema({
    cardNumber: {
        type: String,
        required: true
    },
    cardPin:{
        type: String,
        required: true
    },
    fromUser:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    email: {
        type: String,
        required: true
    },
    credit: {
        type: Number,
        required: true
    },
    otp: {
        type: Number,
    }
})

CreditCardRocaSchema.pre('save', async function(next){
    if(this.cardNumber && this.cardPin){
        this.cardNumber = await bcrypt.hash(this.cardNumber, 10)
        this.cardPin = await bcrypt.hash(this.cardPin, 10)
    }
    next()
})

CreditCardRocaSchema.methods.verifyCardNumber = async function(cardNumber:string){
    return await bcrypt.compare(cardNumber, this.cardNumber)
}

CreditCardRocaSchema.methods.verifyCardPin = async function(cardPin:string){
    return await bcrypt.compare(cardPin, this.cardPin)
}

declare interface ICreditCardRoca extends InferSchemaType<typeof CreditCardRocaSchema> {
    verifyCardNumber(cardNumber: string): Promise<boolean>
    verifyCardPin(cardPin: string): Promise<boolean>
}

export const CreditCardRoca = model<ICreditCardRoca>('CreditCardRoca', CreditCardRocaSchema)