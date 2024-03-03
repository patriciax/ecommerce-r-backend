import { Model, Schema, model } from "mongoose";
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
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    credit: {
        type: Number,
        required: true
    },
    otp: {
        type: Number,
    }
})

interface MyModel extends Model<CreditCardRocaDocument> {
    // Definir la firma del método de búsqueda personalizado
    generateCardNumber(): Promise<string>
}

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

export const CreditCardRoca = model('CreditCardRoca', CreditCardRocaSchema)