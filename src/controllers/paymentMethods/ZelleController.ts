import  {createHash, createCipheriv, createDecipheriv}  from 'crypto';
import { PagoMovil } from '../../models/pagoMovil.schema';
import { DolarPrice } from "../../models/dolarPrice.schema"
import { Request, Response } from 'express';
import { Zelle } from '../../models/zelle.schema';

export class ZelleController {

    public createOrUpdateZelle = async(req: Request, res: Response) => {

        try{

            const zelle = await Zelle.find({})

            if(zelle.length > 0){
                zelle[0].email = req.body.email
                await zelle[0].save()

                return res.status(200).json({
                    status: 'success',
                    message: 'ZELLE_UPDATED',
                    data: zelle[0]
                })

            }

            const newZelle = await Zelle.create({
                email: req.body.email
            })

            return res.status(200).json({
                status: 'success',
                message: 'ZELLE_CREATED',
                data: newZelle
            })


        }catch(err){
            return res.status(500).json({ 
                status: 'error',
                message: 'SOMETHING_WENT_WRONG'
             })
        }

    }

    public deleteZelle = async(req: Request, res: Response) => {

        try{

            const zelle = await Zelle.find({})

            if(zelle.length <= 0) return res.status(404).json({ status: 'fail', message: 'ZELLE_NOT_FOUND' })

            await Zelle.findByIdAndDelete(zelle[0]._id)

            return res.status(201).json({
                status: 'success',
                message: 'ZELLE_DELETED'
            })


        }catch(err){
            
            return res.status(500).json({ 
                status: 'error',
                message: 'SOMETHING_WENT_WRONG'
             })

        }

    }

    public getZelle = async(req: Request, res: Response) => {

        try{

            const zelle = await Zelle.find({})

            return res.status(200).json({
                status: 'success',
                data: zelle[0]
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