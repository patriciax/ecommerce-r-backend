import axios from "axios"
import { PaypalController } from "./paymentMethods/PaypalController"
import { BanescoController } from "./paymentMethods/BanescoController"
import { Product } from "../models/product.schema"
import { Request } from "express";
import { Invoice } from "../models/invoice.schema";
import { randomNumbersGenerator } from "../utils/randomNumbersGenerator";
import { Payment } from "../models/payments.schema";
import { InvoiceProduct } from "../models/invoiceProduct.schema";

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

        this.validateCart(req.body.carts)
        const tracnsactionOrder = await this.generateInvoiceOrder()

        if(req.body.paymentMethod === 'credits'){
            
        }

        else if(req.body.paymentMethod === 'paypal-create-order'){
            const paypalProcess = new PaypalController()
            const order = await paypalProcess.createOrder([])
            return res.status(200).json({
                order
            })
        }

        else if(req.body.paymentMethod === 'paypal-approve-order'){
            const paypalProcess = new PaypalController()
            const response = await paypalProcess.captureOrder(req.body.orderId)

            console.log(response)
            //this.generateInvoice(req, response)

            return res.status(200).json({
                response
            })
        }

        else if(req.body.paymentMethod === 'banesco'){
            const banescoProcess = new BanescoController()
            const response = await banescoProcess.makePayment(req.body.banescoData)

            const payment = this.generatePayment(req, 'banesco', tracnsactionOrder)

            if(response.success){

                await this.generateInvoice(req, tracnsactionOrder, payment)

                return res.status(200).json({
                    status: 'success',
                    message: 'PAYMENT_SUCCESS'
                })
            }

            return res.status(200).json({
                status: 'fail',
                message: 'PAYMENT_FAILED'
            })

        }

        return res.status(200).json({
            status: 'success',
            message: 'Payment process'
        })

    }

    private generateInvoiceOrder = async() => {

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
            
            if(!product) {
                cartProductsOverStock = true
                break;
            }

            if(cart.quantity > product.stock){
                cartProductsOverStock = true
                productOverStock.push(product.name)
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

    private generatePayment = async(req:Request, payment:string, order:string) => {
        let userName = ''
        let userEmail = ''
        let userPhone = ''
        if(!req?.user?._id){
            userName = req.body.name
            userEmail = req.body.email
            userPhone = req.body.phone
        }

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

    private generateInvoice = async(req:Request, order:string, paymentModel:any) => {
        
        let userName = ''
        let userEmail = ''
        let userPhone = ''
        if(!req?.user?._id){
            userName = req.body.name
            userEmail = req.body.email
            userPhone = req.body.phone
        }
        
        const invoice = await Invoice.create({
            user: req?.user?._id,
            name: userName,
            email: userEmail,
            phone: userPhone,
            transaction: order,
            payment: paymentModel._id,
        })

        for(let cart of req.body.carts){

            await InvoiceProduct.create({
                invoice: invoice._id,
                product: cart._id,
                quantity: cart.quantity
            })

        }

        this.subsctractStock(req.body.carts)

    }

    private subsctractStock = async(carts:any) => {
            
        for(let cart of carts){
            const product = await Product.findById(cart.productId)
            if(product){
                product.stock = product.stock - cart.quantity
                await product.save()
            }
        }
    }



}