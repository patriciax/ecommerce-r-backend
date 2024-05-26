import { Request, Response } from "express"
import { CreditCardRoca } from "../../models/creditCardRoca.schema"
import { GiftCard } from "../../models/giftCard.schema"
import { otpCreator } from "../../utils/otpCreator"
import { randomNumbersGenerator } from "../../utils/randomNumbersGenerator"
import { EmailController } from "../emailController"
import { User } from "../../models/user.schema"
import { BanescoController } from "./BanescoController"
import { CheckoutController } from "../checkoutController"
import { PaypalController } from "./PaypalController"
import { ZelleController } from "./ZelleController"
import { PagoMovilController } from "./pagoMovilController"
import { DolarPrice } from "../../models/dolarPrice.schema"
import { Invoice } from "../../models/invoice.schema"
import { Payment } from "../../models/payments.schema"
import { InvoiceProduct } from "../../models/invoiceProduct.schema"
import { Product } from "../../models/product.schema"

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
            const tracnsactionOrder = await checkoutController.generateInvoiceOrder()
            if(req.body.paymentMethod === 'banesco'){
                try{

                    const banescoProcess = new BanescoController()

                    const dolarPrice:any = await DolarPrice.findOne({}).sort({createdAt: -1})
                    const total = req.body.card.total * dolarPrice.price

                    const response = await banescoProcess.makePaymentGiftCard(req.body.banescoData, total)

                    const payment = await checkoutController.generatePayment(req, 'banesco', tracnsactionOrder, response.success ? "approved" : "rejected", 'giftCard')
                    if(response.success){
                        const invoice = await checkoutController.generateInvoice(req, tracnsactionOrder, payment, 'giftCard')
                        await this.createCreditCardRoca(req, res, invoice, 'active')

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
                    return res.status(400).json({
                        status: 'fail',
                        message: 'PAYMENT_FAILED'
                    })
                }
            }

            else if(req.body.paymentMethod === 'paypal-create-order'){
                const paypalProcess = new PaypalController()
                const order = await paypalProcess.createOrderCard(req.body.card.total)

                return res.status(200).json({
                    order,
                    "transactionOrder": tracnsactionOrder
                })
            }
    
            else if(req.body.paymentMethod === 'paypal-approve-order'){
                try{
    
                    const paypalProcess = new PaypalController()
                    const response = await paypalProcess.captureOrder(req.body.orderId)

                    if(response.status == 'COMPLETED'){
    
                        const payment = await checkoutController.generatePayment(req, 'paypal', tracnsactionOrder, response?.status == 'COMPLETED' ? "approved" : "rejected", 'giftCard')
                        const invoice = await checkoutController.generateInvoice(req, tracnsactionOrder, payment, 'giftCard')
                        
                        this.createCreditCardRoca(req, res, invoice, 'active')

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
    
                }catch(error:any){
                    return res.status(400).json({
                        status: 'fail',
                        message: 'PAYMENT_FAILED'
                    })
                }
            }

            else if(req.body.paymentMethod === 'pagoMovil'){
                try{
    
                    const pagoMovilProcess = new PagoMovilController()
                    const response = await pagoMovilProcess.makePayment(req.body.pagoMovilData, req.body.carts)
    
                    const payment = await checkoutController.generatePayment(req, 'pagoMovil', tracnsactionOrder, response, 'giftCard')
                    const invoice = await checkoutController.generateInvoice(req, tracnsactionOrder, payment, 'giftCard')
                    
                    await this.createCreditCardRoca(req, res, invoice, 'inactive')

                    return res.status(200).json({
                        status: 'success',
                        message: 'PAYMENT_SUCCESS',
                        data: {
                            tracnsactionOrder,
                            card: req.body.card
                        }
                    })
                    
    
                }catch(error){
                    console.log(error)
                    return res.status(400).json({
                        status: 'fail',
                        message: 'PAYMENT_FAILED'
                    })
                }
    
            }
    
            else if(req.body.paymentMethod === 'zelle'){
                try{
    
                    const zelleProcess = new ZelleController()
                    const response = await zelleProcess.makePayment(req.body.pagoMovilData, req.body.carts)
    
                    const payment = await checkoutController.generatePayment(req, 'zelle', tracnsactionOrder, response, 'giftCard')
                    const invoice = await checkoutController.generateInvoice(req, tracnsactionOrder, payment, 'giftCard')

                    await this.createCreditCardRoca(req, res, invoice, 'inactive')
    
                    return res.status(200).json({
                        status: 'success',
                        message: 'PAYMENT_SUCCESS',
                        data: {
                            tracnsactionOrder,
                            card: req.body.card
                        }
                    })
                    
    
                }catch(error){
        
                    return res.status(400).json({
                        status: 'fail',
                        message: 'PAYMENT_FAILED'
                    })
                }
    
            }

        }catch(error){
            res.status(400).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }
    }

    public createCreditCardRoca = async (request: Request, response: Response, invoice:any, status:string = 'active') => {
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
            creditCardNumber = randomNumbersGenerator(16)

            const cardPin = randomNumbersGenerator(4)

            await CreditCardRoca.create({
                cardNumber: creditCardNumber,
                cardPin: cardPin,
                invoice: invoice._id,
                status: status,
                credit: giftCard.amount,
                email: request.body.card.emailTo,
                fromUser: request?.user?._id,
                message: request.body.card.message
            })
            
            if(status == 'active'){
                const emailController = new EmailController()
                emailController.sendEmail("giftCard", request.body.card.emailTo, "Gift card recibida", {
                    cardNumber: creditCardNumber,
                    cardPin: cardPin,
                    message: request.body.card.message
                })
            }

            return {
                status: 'success',
                message: 'CREDIT_CARD_ROCA_CREATED',
            }

        }catch(error){
            console.log(error)
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

    public makePayment = async(data:any, cart:any, carrierRate:any = null) => {
        try{

            
            const total = cart.reduce((acc:number, item:any) => acc + (item.priceDiscount || item.price) * item.quantity, 0)

            
            const subtotal = (total + (carrierRate ? carrierRate?.amount * 1 : 0))
            let taxAmount = subtotal * (carrierRate ? 0.06998 : 0.16)
            const finalTotal = taxAmount * 1 + subtotal * 1
       
            const creditCardRoca = await CreditCardRoca.find({ email: data.emailCard })
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

            if(credits < finalTotal){
                return {
                    status: 'fail',
                    message: 'INSUFFICIENT_CREDITS'
                }
            }

            const creditsToUpdate = credits - finalTotal
            const findCard = await CreditCardRoca.findByIdAndUpdate(cardId, {credit: creditsToUpdate}, { overwriteDiscriminatorKey: true, new: true })

            return {
                status: 'success',
                message: 'PAYMENT_SUCCESS',
            }

        }catch(error){
            console.log("error", error)           
            return {
                status: 'fail',
                message: 'CREDIT_CARD_NOT_FOUND'
            }
        }
    }

    public updateGiftCardStatus = async(req:Request, res:Response) => {
        
        try{

            const emailController = new EmailController()
            const invoice = await Invoice.findById(req.params.invoice)
             
            if(!invoice){
                return res.status(404).json({
                    status: 'fail',
                    message: "NOT_FOUND"
                })
            }

            const payment = await Payment.findById(invoice.payment)

            if(!payment){
                return res.status(404).json({
                    status: 'fail',
                    message: "NOT_FOUND"
                })
            }

            if (req.body.status === "pending" || req.body.status === "approved" || req.body.status === "rejected") {
                payment.status = req.body.status;
            } else {
                payment.status = 'pending';
            }

            await payment.save()

            if(payment.status == 'approved'){

                const creditCardNumber = randomNumbersGenerator(16)
                const cardPin = randomNumbersGenerator(4)

                 const creditCardCopy = await CreditCardRoca.findOne({invoice: req.params.invoice});

                const creditCardObject = await CreditCardRoca.create({invoice: invoice._id, cardNumber: creditCardNumber, cardPin: cardPin, status: 'active', credit: creditCardCopy?.credit, email: creditCardCopy?.email, fromUser: creditCardCopy?.fromUser, message: creditCardCopy?.message  })

                await CreditCardRoca.findByIdAndDelete(creditCardCopy?._id)

                if(!creditCardObject){
                    return res.status(404).json({
                        status: 'fail',
                        message: "NOT_FOUND"
                    })
                }

                emailController.sendEmail("giftCard", creditCardObject?.email, "Gift card recibida", {
                    cardNumber: creditCardNumber,
                    cardPin: cardPin,
                    message: creditCardObject?.message
                })
            }

            else if(payment.status == 'rejected'){

                emailController.sendEmail("rejectedPayment", invoice?.email ?? '', "Pago rechazado", {
                    "reference": invoice.pagoMovilReference
                })

            }

            return res.status(200).json({
                status: 'success',
                data: {
                    payment
                }
            })

        }catch(error){
            
            return error
        }

    }

}