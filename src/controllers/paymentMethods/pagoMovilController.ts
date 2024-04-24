import  {createHash, createCipheriv, createDecipheriv}  from 'crypto';
import { PagoMovil } from '../../models/pagoMovil.schema';
import { DolarPrice } from "../../models/dolarPrice.schema"
import { Request, Response } from 'express';

export class PagoMovilController {

    public createOrUpdatePagoMovil = async(req: Request, res: Response) => {

        try{

            const pagoMovil = await PagoMovil.find({})

            if(pagoMovil.length > 0){
                pagoMovil[0].bank = req.body.bank
                pagoMovil[0].phone = req.body.phone
                pagoMovil[0].identification = req.body.identification
                await pagoMovil[0].save()

                return res.status(200).json({
                    status: 'success',
                    message: 'PAGO_MOVIL_UPDATED',
                    data: pagoMovil[0]
                })

            }

            const newPagoMovil = await PagoMovil.create({
                bank: req.body.bank,
                phone: req.body.phone,
                identification: req.body.identification
            })

            return res.status(200).json({
                status: 'success',
                message: 'PAGO_MOVIL_CREATED',
                data: newPagoMovil
            })


        }catch(err){
            console.log(err)
            return res.status(500).json({ 
                status: 'error',
                message: 'SOMETHING_WENT_WRONG'
             })
        }

    }

    public deletePagoMovil = async(req: Request, res: Response) => {

        try{

            const pagoMovil = await PagoMovil.find({})

            if(pagoMovil.length <= 0) return res.status(404).json({ status: 'fail', message: 'PAGO_MOVIL_NOT_FOUND' })

            await PagoMovil.findByIdAndDelete(pagoMovil[0]._id)

            return res.status(201).json({
                status: 'success',
                message: 'PAGO_MOVIL_DELETED'
            })


        }catch(err){
            
            return res.status(500).json({ 
                status: 'error',
                message: 'SOMETHING_WENT_WRONG'
             })

        }

    }

    public getPagoMovil = async(req: Request, res: Response) => {

        try{

            const pagoMovil = await PagoMovil.find({})

            return res.status(200).json({
                status: 'success',
                data: pagoMovil[0]
            })


        }catch(err){
            
            return res.status(500).json({ 
                status: 'error',
                message: 'SOMETHING_WENT_WRONG'
             })

        }

    }

    public makePayment = async(data:any, cart:any) => {
        
        try{

            const dolarPrice:any = await DolarPrice.findOne({}).sort({createdAt: -1})
            const total = cart.reduce((acc:number, item:any) => acc + (item.priceDiscount || item.price) * item.quantity, 0) * dolarPrice?.price ?? 1

            return total

        }catch(error){
            
            return error
        }

    }


}