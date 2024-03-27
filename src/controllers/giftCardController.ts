import { Request, Response } from 'express'
import {GiftCard} from '../models/giftCard.schema'
import { APIFeatures } from '../utils/apiFeatures'
import { CreditCardRoca } from '../models/creditCardRoca.schema'
import { EmailController } from './emailController'

export class GiftCardController {

    private validateForm = (req:Request) => {

        const errors = []

        if(!req.body.title) errors.push('Nombre del gift card es requerido')
        if(!req.body.titleEnglish) errors.push('Nombre del gift card en inglés es requerido')
        if(!req.body.amount) errors.push('Precio es requerido')

        return errors

    }

    public createGiftCard = async(req:Request, res:Response) : Promise<any> => {

        try{

            const errors = this.validateForm(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

            const giftCard = await GiftCard.create({
                name: req.body.title,
                englishName: req.body.titleEnglish,
                amount: req.body.amount
            })

            return res.status(201).json({
                status: 'success',
                data: giftCard
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }

    }

    public giftCards = async(req:Request, res:Response) : Promise<any> => {
            
        try{
            const features = new APIFeatures(GiftCard.find(), req.query).paginate();
            const giftCards = await features.query;

            const totalGiftCards = await GiftCard.find();
            const totalPages = totalGiftCards.length / Number(req?.query?.limit || 1);
            
            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
                results: giftCards.length,
                data: {
                    giftCards
                }
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }
    }

    public updateGiftCard = async(req:Request, res:Response) => {

        try{
            
            const errors = this.validateForm(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

            const giftCard = await GiftCard.findById(req.params.id);

            if (!giftCard) return res.status(404).json({ status: 'fail', message: 'No gift card found with that ID' });

            const updatedGiftCard = await GiftCard.findByIdAndUpdate(req.params.id, {
                name: req.body.title,
                englishName: req.body.titleEnglish,
                amount: req.body.amount
            }, {
                new: true,
                runValidators: true
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    updatedGiftCard
                }
            })

        }catch(err:any){

            return res.status(404).json({
                status: 'fail',
                message: err.message
            })

        }

    }

    public deleteGiftCard = async(req:Request, res:Response) => {
        
        try{
            const giftCard = await GiftCard.findByIdAndUpdate(req.params.id, {deletedAt: new Date()});

            if (!giftCard) return res.status(404).json({ status: 'fail', message: 'No gift card found with that ID' });

            return res.status(204).json({
                status: 'success',
                data: null
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No gift card found with that ID'
            })
        }

    }

    public getGiftCard = async(req:Request, res:Response) => {
        try{

            const giftCard = await GiftCard.findById(req.params.id);

            if (!giftCard) return res.status(404).json({ status: 'fail', message: 'No gift card found with that ID' });

            return res.status(200).json({
                status: 'success',
                data: giftCard
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No gift card found with that ID'
            })
        }
    }
}