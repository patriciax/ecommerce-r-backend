import { PaypalController } from "./paymentMethods/PaypalController"
import { BanescoController } from "./paymentMethods/BanescoController"
import { Product } from "../models/product.schema"
import { Request } from "express";
import { Invoice } from "../models/invoice.schema";
import { randomNumbersGenerator } from "../utils/randomNumbersGenerator";
import { Payment } from "../models/payments.schema";
import { InvoiceProduct } from "../models/invoiceProduct.schema";
import { EmailController } from "./emailController";
import { AdminEmail } from "../models/adminEmail.schema";
import { Cart } from "../models/cart.schema";
import { CreditCardRoca } from "../models/creditCardRoca.schema";
import { CreditCardRocaController } from "./paymentMethods/CreditCardRocaController";
import { PagoMovilController } from "./paymentMethods/pagoMovilController";
import { DolarPrice } from "../models/dolarPrice.schema";
import { PagoMovil } from "../models/pagoMovil.schema";
import { ZelleController } from "./paymentMethods/ZelleController";
import { Zelle } from "../models/zelle.schema";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}


export class CheckoutController {

    paymentMethods = [
        'credits',
        'paypal-create-order',
        'paypal-approve-order',
        'applepay',
        'mercantil',
        'banesco'
    ]
    
    public paymentProcess = async (req: any, res: any) => {
        
        let tracnsactionOrder = ''
        if((req.body.paymentMethod !== 'paypal-approve-order')){
            const result = await this.validateCart(req.body.carts)
        
            if(result?.status != 'success'){
                return res.status(200).json(result)
            }

            tracnsactionOrder = await this.generateInvoiceOrder()

        }

        if(req.body.paymentMethod === 'giftCard'){
            try{

                const creditCardRocaController = new CreditCardRocaController()
                const response = await creditCardRocaController.makePayment(req.body, req.body.carts)

                const payment:any = await this.generatePayment(req, 'giftCard', tracnsactionOrder, response?.status == 'success' ? "approved" : "rejected")
                if(response?.status == 'success'){

                    const invoice = await this.generateInvoice(req, tracnsactionOrder, payment)

                    this.clearCarts(req)

                    return res.status(200).json({
                        status: 'success',
                        message: 'PAYMENT_SUCCESS',
                        data: {
                            invoice,
                            cart: req.body.carts
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

        else if(req.body.paymentMethod === 'paypal-create-order'){
            const paypalProcess = new PaypalController()
            const order = await paypalProcess.createOrder(req.body.carts, req.body.ivaType)
            return res.status(200).json({
                order,
                "transactionOrder": tracnsactionOrder
            })
        }

        else if(req.body.paymentMethod === 'paypal-approve-order'){
            try{

                const paypalProcess = new PaypalController()
                const response = await paypalProcess.captureOrder(req.body.orderId)

                const payment = await this.generatePayment(req, 'paypal', req.body.orderId, response?.status == 'COMPLETED' ? "approved" : "rejected")

                if(response.status == 'COMPLETED'){

                    const invoice = await this.generateInvoice(req, req.body.orderId, payment)

                    this.clearCarts(req)

                    return res.status(200).json({
                        status: 'success',
                        message: 'PAYMENT_SUCCESS',
                        data: {
                            invoice,
                            cart: req.body.carts
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

        else if(req.body.paymentMethod === 'banesco'){
            try{

                const ip = req.ip.split(':').pop()
                req.body.banescoData.ip = ip

                const banescoProcess = new BanescoController()
                const response = await banescoProcess.makePayment(req.body.banescoData, req.body.carts, 'national')
                const payment = await this.generatePayment(req, 'banesco', tracnsactionOrder, response.success ? "approved" : "rejected")
                
                if(response.success){

                    const invoice = await this.generateInvoice(req, tracnsactionOrder, payment)

                    this.clearCarts(req)

                    return res.status(200).json({
                        status: 'success',
                        message: 'PAYMENT_SUCCESS',
                        data: {
                            invoice,
                            cart: req.body.carts
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

        else if(req.body.paymentMethod === 'pagoMovil'){
            try{

                const pagoMovilProcess = new PagoMovilController()
                const response = await pagoMovilProcess.makePayment(req.body.pagoMovilData, req.body.carts)

                const payment = await this.generatePayment(req, 'pagoMovil', tracnsactionOrder, response)
                
                const invoice = await this.generateInvoice(req, tracnsactionOrder, payment)

                this.clearCarts(req)

                return res.status(200).json({
                    status: 'success',
                    message: 'PAYMENT_SUCCESS',
                    data: {
                        invoice,
                        cart: req.body.carts
                    }
                })
                

            }catch(error){
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

                const payment = await this.generatePayment(req, 'zelle', tracnsactionOrder, response)
                
                const invoice = await this.generateInvoice(req, tracnsactionOrder, payment)

                this.clearCarts(req)

                return res.status(200).json({
                    status: 'success',
                    message: 'PAYMENT_SUCCESS',
                    data: {
                        invoice,
                        cart: req.body.carts
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

        return res.status(200).json({
            status: 'success',
            message: 'Payment process'
        })

    }

    public generateInvoiceOrder = async() => {

        let transactionOrder = ''
        let exists = true;
        while(exists){
            transactionOrder = randomNumbersGenerator(16)
            exists = await Invoice.findOne({ transactionOrder: transactionOrder }) || false;
        }

        return transactionOrder

    }

    private validateCart = async(carts:any) => {

        const cartProduct = []
        let productDoesNotExist = false

        for(let cart of carts){
            const product = await Product.findById(cart.productId)
            if(product)
                cartProduct.push(product)

            else{
                productDoesNotExist = true
                break            
            }
        }

        if(productDoesNotExist){
            return {
                status: 'fail',
                message: 'PRODUCT_NOT_EXIST'
            }
        }

        let cartProductsOverStock = false
        const productOverStock = []

        for(let cart of carts){
            const product = await Product.findById(cart.productId)
            const productVariation = product?.productVariations.find((variation:any) => variation.color == cart.color._id && variation.size == cart.size._id)

            if(product && productVariation){
                if(cart.quantity > productVariation?.stock){
                    cartProductsOverStock = true
                    productOverStock.push(product.name)
                }
            }

        }

        if(cartProductsOverStock){
            return {
                status: 'fail',
                message: 'PRODUCT_OVER_STOCK',
                data: {
                    productOverStock
                }
            }
        }

        return {
            status: 'success'
        }
    }

    public generatePayment = async(req:Request, payment:string, order:string, paymentStatus:any, purchaseType:string = 'invoice') => {
        let userName = ''
        let userEmail = ''
        let userPhone = ''
        
        userName = req?.user ? req?.user.name : req.body.name
        userEmail = req?.user ? req?.user.email : req.body.email
        userPhone = req?.user ? req?.user.phone : req.body.phone
        let pagoMovilData:any = null
        let zelleData:any = null

        if(payment == 'pagoMovil')
            pagoMovilData = await PagoMovil.find({})

        if(payment == 'zelle')
            zelleData = await Zelle.find({})
        
        let total = 0
        const dolarPrice:any = await DolarPrice.findOne({}).sort({createdAt: -1})

        if(purchaseType == 'invoice')
            total = req.body.carts?.reduce((acc:number, item:any) => acc + (item.priceDiscount || item.price) * item.quantity, 0) ?? 0

        else if(purchaseType == 'giftCard')
            total = req.body.card.total
        
        const finalTotal = payment == 'banesco' || payment == 'pagoMovil' ? total * dolarPrice?.price : total

        const paymentModel = await Payment.create({
            user: req?.user?._id,   
            name: userName,
            email: userEmail,
            phone: userPhone,
            transactionId: order,
            type: payment,
            status: payment == 'pagoMovil' || payment == 'zelle' ? 'pending' : paymentStatus,
            total: finalTotal,
            bank: payment == 'pagoMovil' ? pagoMovilData[0]?.bank : undefined,
            zelleEmail: payment == 'zelle' ? zelleData[0]?.email : undefined,
            purchaseType
        })

        return paymentModel

    }

    public generateInvoice = async(req:Request, order:string, paymentModel:any, purchaseType:string = 'invoice') => {
        
        let userName = ''
        let userEmail = ''
        let userPhone = ''
        
        userName = req?.user ? req?.user.name : req.body.name
        userEmail = req?.user ? req?.user.email : req.body.email
        userPhone = req?.user ? req?.user.phone : req.body.phone
        
        const invoice = await Invoice.create({
            user: req?.user?._id,
            name: userName,
            email: userEmail,
            phone: userPhone,
            transactionOrder: order,
            payment: paymentModel._id,
            carrier: req.body.carrier,
            purchaseType,
            pagoMovilReference: req.body.pagoMovilData?.reference ?? undefined,
            pagoMovilDate: req.body.pagoMovilData?.date ?? undefined
        })

        if(purchaseType == 'invoice'){
            const invoiceProducts = []

            for(let cart of req.body.carts){

                const productModel = cart.name
                const sizeModel = cart.size.name
                const colorModel = cart.color.name

                invoiceProducts.push(
                    {
                        invoice: invoice._id,
                        product: cart.productId,
                        quantity: cart.quantity,
                        size: cart.size._id,
                        color: cart.color._id,
                        productModel: productModel,
                        colorModel: colorModel,
                        sizeModel: sizeModel
                    }
                )

            }

            await InvoiceProduct.insertMany(invoiceProducts)
            const receiverEmail = req?.user?.email || userEmail
            const receiverName = req?.user?.name || userName

            this.sendInvoiceEmail(receiverEmail, order, receiverName, invoiceProducts)

            const adminEmail = await AdminEmail.findOne()
            if(adminEmail){
                this.sendInvoiceEmail(adminEmail.email, order, receiverName, invoiceProducts, true)
            }
            
            this.subsctractStock(req.body.carts)
        
        }
         
        return invoice
    }

    private subsctractStock = async(carts:any) => {
            
        for(let cart of carts){
            const product = await Product.findById(cart.productId)
            const productVariationIndex = product?.productVariations.findIndex((variation:any) => variation.color == cart.color._id && variation.size == cart.size._id)
            if(productVariationIndex != undefined && product){
                product.productVariations[productVariationIndex].stock = product.productVariations[productVariationIndex].stock - cart.quantity
                await product.save()
            }
        }
    }

    private sendInvoiceEmail  = async(email:string, invoiceNumber:string, name:string, carts:any, isAdmin:boolean = false) => {

        const emailController = new EmailController()
        emailController.sendEmail(isAdmin ? "invoiceAdmin" : "invoice", email, "Factura ERoca", {
            "invoiceNumber": invoiceNumber,
            "user": name,
            "carts": carts
        })
    }

    private clearCarts = async(req:Request) => {

        await Cart.deleteMany({ user: req?.user?._id })

    }

}