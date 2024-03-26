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

    private validateOTP = (request: Request) => {
        const errors = []
        if(!request.body.otp) errors.push('OTP_REQUIRED')

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

                    const payment = await checkoutController.generatePayment(req, 'banesco', tracnsactionOrder)

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
            console.log(giftCard)
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
            
            const creditCardRoca = await CreditCardRoca.find({ email: request?.user?.email })
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