import axios from "axios"
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

        if(req.body.paymentMethod === 'credits'){
            
        }

        else if(req.body.paymentMethod === 'paypal-create-order'){
            const paypalProcess = new PaypalController()
            const order = await paypalProcess.createOrder(req.body.carts)
            return res.status(200).json({
                order,
                "transactionOrder": tracnsactionOrder
            })
        }

        else if(req.body.paymentMethod === 'paypal-approve-order'){
            try{

                const paypalProcess = new PaypalController()
                const response = await paypalProcess.captureOrder(req.body.orderId)

                const payment = await this.generatePayment(req, 'paypal', req.body.orderId)

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

                const banescoProcess = new BanescoController()
                const response = await banescoProcess.makePayment(req.body.banescoData, req.body.carts)

                const payment = await this.generatePayment(req, 'banesco', tracnsactionOrder)

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

    public generatePayment = async(req:Request, payment:string, order:string) => {
        let userName = ''
        let userEmail = ''
        let userPhone = ''
        
        userName = req?.user ? req?.user.name : req.body.name
        userEmail = req?.user ? req?.user.email : req.body.email
        userPhone = req?.user ? req?.user.phone : req.body.phone
        
        const paymentModel = await Payment.create({
            user: req?.user?._id,   
            name: userName,
            email: userEmail,
            phone: userPhone,
            transactionId: order,
            type: payment,
            status: 'approved'
        })

        return paymentModel

    }

    public generateInvoice = async(req:Request, order:string, paymentModel:any) => {
        
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
            carrier: req.body.carrier
        })

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