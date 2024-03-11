import { Request, Response } from "express"
import { CreditCardRoca } from "../../models/creditCardRoca.schema"
import { GiftCard } from "../../models/giftCard.schema"
import { otpCreator } from "../../utils/otpCreator"
import { randomNumbersGenerator } from "../../utils/randomNumbersGenerator"
import { EmailController } from "../emailController"
import { User } from "../../models/user.schema"

// declare global {
//     namespace Express {
//         interface Request {
//             user?: any;
//         }
//     }
// }

export class CreditCardRocaController {

    private validateForm = (request: Request) => {
        const errors = []
        if(!request.body.giftCardId) errors.push('GIFT_CARD_REQUIRED')
        if(!request.body.email) errors.push('EMAIL_REQUIRED')

        return errors
    }

    private validateOTP = (request: Request) => {
        const errors = []
        if(!request.body.otp) errors.push('OTP_REQUIRED')

        return errors
    }

    public createCreditCardRoca = async (request: Request, response: Response) => {
        try{

            const errors = this.validateForm(request)
            if(errors.length > 0){
                return response.status(422).json({
                    status: 'fail',
                    message: 'VALIDATION_ERROR',
                    errors: errors
                })
            }

            const giftCard = await GiftCard.findById(request.body.giftCardId)

            if(!giftCard){
                return response.status(404).json({
                    status: 'fail',
                    message: 'GIFT_CARD_NOT_FOUND'
                })
            }

            const creditCardOtp = otpCreator()

            let creditCardNumber = null
            let exists = true;
            while(exists){
                creditCardNumber = randomNumbersGenerator(16)
                exists = await CreditCardRoca.findOne({ cardNumber: creditCardNumber }) || false;
            }

            const cardPin = randomNumbersGenerator(4)

            const creditCardRoca = await CreditCardRoca.create({
                cardNumber: creditCardNumber,
                cardPin: cardPin,
                credit: giftCard.amount,
                otp: creditCardOtp,
                email: request.body.email,
                fromUser: request?.user?._id,
            })
            
            const emailController = new EmailController()
            emailController.sendEmail("giftCard", request.body.email, "Gift card recibida", {
                emailOtp: creditCardOtp,
                cardNumber: creditCardNumber,
                cardPin: cardPin,
            })

            response.status(201).json({
                status: 'success',
                message: 'CREDIT_CARD_ROCA_CREATED',
            })

        }catch(error){
            response.status(400).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }
    }

    public validateGifCardOtp = async(request:Request, response:Response) => {

        try{

            const errors = this.validateOTP(request)
            if(errors.length > 0){
                return response.status(422).json({
                    status: 'fail',
                    message: 'VALIDATION_ERROR',
                    errors: errors
                })
            }

            const creditCardRoca = await CreditCardRoca.findOne({ otp: request.body.otp, email: request?.user?.email })

            if(!creditCardRoca){
                return response.status(404).json({
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                })
            }

            creditCardRoca.otp = null
            creditCardRoca.user = request?.user?._id
            await creditCardRoca.save()

            response.status(200).json({
                status: 'success',
                message: 'CREDIT_CARD_ROCA_VALIDATED',
            })


        }catch(error){
            response.status(400).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }

    }

    public verifyCredits = async(request:Request, response:Response) => {

        try{
            console.log(request.user)
            const creditCardRoca = await CreditCardRoca.find({ email: request?.user?.email })
            console.log(creditCardRoca)
            if(!creditCardRoca){
                return response.status(404).json({
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                })
            }

            let card = null
            for (let creditCard of creditCardRoca) {

                if(await creditCard.verifyCardNumber(request.body.cardNumber) && await creditCard.verifyCardPin(request.body.cardPin)){
                    card = creditCard
                }
            }

            if(!card){
                return response.status(404).json({
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                })
            }

            return response.status(200).json({
                status: 'success',
                data: card.credit,
            })

        }catch(error){
            response.status(400).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }

    }

}