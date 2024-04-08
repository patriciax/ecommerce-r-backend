import { Request, Response } from "express";
import { Invoice } from "../models/invoice.schema";
import { APIFeatures } from "../utils/apiFeatures";
import { EmailController } from "./emailController";

export class InvoiceController {

    public listInvoices = async (req: Request, res: Response) => {

        try{

            const features = new APIFeatures(Invoice.find().populate('user').populate("invoiceProduct"), req.query)
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

}