import { Request, Response } from "express"
import { CreditCardRoca } from "../../models/creditCardRoca.schema"
import { GiftCard } from "../../models/giftCard.schema"
import { otpCreator } from "../../utils/otpCreator"
import { randomNumbersGenerator } from "../../utils/randomNumbersGenerator"
import { EmailController } from "../emailController"
import { User } from "../../models/user.schema"

export class CreditCardRocaController {

    private validateForm = (request: Request) => {
        const errors = []
        if(!request.body.giftCardId) errors.push('GIFT_CARD_REQUIRED')
        if(!request.body.email) errors.push('EMAIL_REQUIRED')

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
                otp: creditCardOtp
            })
            
            const emailController = new EmailController()
            emailController.sendEmail("giftCard", request.body.email, "Gift card recibida", {
                emailOtp: creditCardOtp
            })

        }catch(error){

        }
    }

}