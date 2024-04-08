import { Request, Response } from "express"
import { CreditCardRoca } from "../../models/creditCardRoca.schema"
import { GiftCard } from "../../models/giftCard.schema"
import { otpCreator } from "../../utils/otpCreator"
import { randomNumbersGenerator } from "../../utils/randomNumbersGenerator"
import { EmailController } from "../emailController"
import { User } from "../../models/user.schema"
import { BanescoController } from "./BanescoController"
import { CheckoutController } from "../checkoutController"

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
        if(!request.body.card.emailTo) errors.push('EMAIL_REQUIRED')

        return errors
    }

    public purchaseCreditCardRoca = async (req: Request, res: Response) => {
        try{
            const checkoutController = new CheckoutController()
            if(req.body.paymentMethod === 'banesco'){
                try{

                    const tracnsactionOrder = await checkoutController.generateInvoiceOrder()
                    const banescoProcess = new BanescoController()
                    const response = await banescoProcess.makePaymentGiftCard(req.body.banescoData, req.body.card.total)

                    const payment = await checkoutController.generatePayment(req, 'banesco', tracnsactionOrder, response)
                    if(response.success){

                        this.createCreditCardRoca(req, res)

                        return res.status(200).json({
                            status: 'success',
                            message: 'PAYMENT_SUCCESS',
                            data: {
                                tracnsactionOrder,
                                card: req.body.card
                            }
                        })

                    }

                    return res.status(400).json({
                        status: 'fail',
                        message: 'PAYMENT_FAILED'
                    })

                }catch(error){
                    console.log(error)
                    return res.status(400).json({
                        status: 'fail',
                        message: 'PAYMENT_FAILED'
                    })
                }
            }

        }catch(error){
            console.log(error) 
            res.status(400).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }
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

            const giftCard = await GiftCard.findOne({amount: request.body.card.total})

            if(!giftCard){
                return {
                    status: 'fail',
                    message: 'GIFT_CARD_NOT_FOUND'
                }
            }

            let creditCardNumber = null
            let exists = true;
            while(exists){
                creditCardNumber = randomNumbersGenerator(16)
                exists = await CreditCardRoca.findOne({ cardNumber: creditCardNumber }) || false;
            }

            const cardPin = randomNumbersGenerator(4)

            await CreditCardRoca.create({
                cardNumber: creditCardNumber,
                cardPin: cardPin,
                credit: giftCard.amount,
                email: request.body.card.emailTo,
                fromUser: request?.user?._id,
            })
            
            const emailController = new EmailController()
            emailController.sendEmail("giftCard", request.body.card.emailTo, "Gift card recibida", {
                cardNumber: creditCardNumber,
                cardPin: cardPin,
            })

            return {
                status: 'success',
                message: 'CREDIT_CARD_ROCA_CREATED',
            }

        }catch(error){
            return {
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            }
        }
    }

    public verifyCredits = async(request:Request, response:Response) => {

        try{
            
            const creditCardRoca = await CreditCardRoca.find({ email: request?.body?.email })
            if(!creditCardRoca){
                return response.status(404).json({
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                })
            }

            let cardPin = null
            let credits = null
            let cardNumber = null

            for (let card of creditCardRoca) {

                cardNumber = await card.verifyCardNumber(request.body.cardNumber)
                cardPin = await card.verifyCardPin(request.body.cardPin)
                credits = card.credit

                if(cardNumber && cardPin){
                    break;
                }
            }

            if(!cardNumber || !cardPin){
                return response.status(404).json({
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                })
            }

            const emailController = new EmailController()
            emailController.sendEmail("creditCardBalance", request.body.email, "Balance de GiftCard ERoca", {
                "cardNumber": request.body.cardNumber,
                "cardPin": request.body.cardPin,
                "credits": credits
            })

            return response.status(200).json({
                status: 'success',
                message: 'CREDIT_CARD_SENT'
            })

        }catch(error){
            response.status(400).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }

    }

    public updateCreditCardRoca = async(creditCard:any) => {
        try{

            const creditCardRoca = await CreditCardRoca.findByIdAndUpdate(creditCard._id, {credits: creditCard})
            if(!creditCardRoca){
                return {
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                }
            }

            return {
                status: 'success',
                message: 'CREDIT_CARD_UPDATED'
            }

        }catch(error){
            return {
                status: 'fail',
                message: 'CREDIT_CARD_NOT_FOUND'
            }
        }
    }

    public makePayment = async(data:any, cart:any) => {
        try{

            const total = cart.reduce((acc:number, item:any) => acc + (item.priceDiscount || item.price) * item.quantity, 0)
       
            const creditCardRoca = await CreditCardRoca.find({ email: data.email })
            if(!creditCardRoca){
                return {
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                }
            }

            let cardId = null
            let cardPin = null
            let credits = null
            let cardNumber = null

            for (let card of creditCardRoca) {

                cardId = card.id
                cardNumber = await card.verifyCardNumber(data.cardNumber)
                cardPin = await card.verifyCardPin(data.cardPin)
                credits = card.credit

                if(cardNumber && cardPin){
                    break;
                }
            }

            if(!cardNumber || !cardPin || !credits){
                return {
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                }
            }

            if(credits < total){
                return {
                    status: 'fail',
                    message: 'INSUFFICIENT_CREDITS'
                }
            }

            const creditsToUpdate = credits - total
            const findCard = await CreditCardRoca.findByIdAndUpdate(cardId, {credit: creditsToUpdate}, { overwriteDiscriminatorKey: true, new: true })
 
            
            return {
                status: 'success',
                message: 'PAYMENT_SUCCESS',
            }

        }catch(error){
            
            return {
                status: 'fail',
                message: 'CREDIT_CARD_NOT_FOUND'
            }
        }
    }

}