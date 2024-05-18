import { Request, Response } from "express";
import { Invoice } from "../models/invoice.schema";
import { APIFeatures } from "../utils/apiFeatures";
import { EmailController } from "./emailController";
import { Payment } from "../models/payments.schema";
import { InvoiceProduct } from "../models/invoiceProduct.schema";
import { Product } from "../models/product.schema";
import { ShipmentController } from "./shipmentController";
import { AllTimePayment } from "../models/allTimePayments";

export class InvoiceController {

    public listInvoices = async (req: Request, res: Response) => {

        try{

            const features = new APIFeatures(Invoice.find().populate("payment").populate('user').populate("invoiceProduct"), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            const invoices = await features.query

            const totalInvoices = await Invoice.find();
            const totalPages = totalInvoices.length / Number(req?.query?.limit || 1);
            
            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
                results: invoices.length,
                data: {
                    invoices
                }
            })

        }catch(error){
            console.log(error)
        }

    }

    public updateInvoice = async (req: Request, res: Response) => {

        try{

            const invoice = await Invoice.findByIdAndUpdate(req.params.invoice, {
                shippingTracking: req.body.shippingTracking,
            })

            if(!invoice){
                return res.status(404).json({
                    status: 'fail',
                    message: "NOT_FOUND"
                })
            }

            const emailController = new EmailController()
            emailController.sendEmail("shipTracking", invoice?.email ?? '', "Tracking de envío", {
                "invoiceNumber": invoice.transactionOrder,
                "tracking": invoice.shippingTracking
            })

            return res.status(200).json({
                status: 'success',
                data: {
                    invoice
                }
            })

        }catch(error){

        }

    }

    public updateInvoiceStatus = async(req:Request, res:Response) => {
        
        try{

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

            if(payment.status == 'rejected'){
                const invoiceProducts = await InvoiceProduct.find({invoice: invoice._id})
                
                invoiceProducts.forEach(async (invoiceProduct) => {
                    
                    const product = await Product.findById(invoiceProduct.product)
                    if(product){
                        product.productVariations.forEach(variation => {
                            
                            if(invoiceProduct.size?._id.toString() == variation.size[0].toString() && invoiceProduct.color?._id.toString() == variation.color[0].toString()){
                                variation.stock = variation.stock + invoiceProduct.quantity
                            }
                            
                        })

                        await product?.save()
                    }

                })

                const emailController = new EmailController()
                emailController.sendEmail("rejectedPayment", invoice?.email ?? '', "Pago rechazado", {
                    "reference": invoice.pagoMovilReference
                })

            }else{

          
                let allTimePaymentTotal = payment.taxAmount + payment.total
                allTimePaymentTotal = allTimePaymentTotal * 1 + (payment?.carrierRate?.amount ? parseFloat(payment?.carrierRate?.amount) : 0) * 1
                
                const allTimePaymentFind = await AllTimePayment.findOne({})
                if(!allTimePaymentFind){
                    await AllTimePayment.create({
                        amount: allTimePaymentTotal
                    })
                }else{
                    
                    const totalToUpdate = (allTimePaymentFind.amount ?? 0) * 1 + allTimePaymentTotal * 1
                    await AllTimePayment.findByIdAndUpdate(allTimePaymentFind._id, {
                        amount: totalToUpdate
                    })
                }
                if(payment.carrierRate){
                    const shipmentController = new ShipmentController()
                    const response = await shipmentController.createShipment(payment.carrierRate.objectId)

                    invoice.shippingTracking = response.trackingNumber
                }
                
                await invoice.save()

            }

            await payment.save();
            return res.status(200).json({
                status: 'success',
                data: {
                    payment
                }
            })

        }catch(error){
            console.log(error)
            return error
        }

    }

    public userInvoices = async (req: Request, res: Response) => {

        try{

            const features = new APIFeatures(Invoice.find({user: req.user._id, purchaseType: 'invoice'}).populate("payment").populate("invoiceProduct"), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            const invoices = await features.query

            return res.status(200).json({
                status: 'success',
                results: invoices.length,
                data: {
                    invoices
                }
            })

        }catch(error){
            return res.status(400).json({
                status: 'error'
            })
        }

    }

}