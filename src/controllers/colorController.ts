import { Request, Response } from 'express'
import {Color} from '../models/color.schema'
import { APIFeatures } from '../utils/apiFeatures'

export class ColorController {

    public createColor = async(req:Request, res:Response) : Promise<any> => {

        try{
            
            const color = await Color.create({
                name: req.body.title,
                hex: req.body.hexColor
            })

            return res.status(201).json({
                status: 'success',
                data: color
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }

    }

    public colors = async(req:Request, res:Response) : Promise<any> => {
            
        try{
            const features = new APIFeatures(Color.find(), req.query)
            const colors = await features.query
            
            return res.status(200).json({
                status: 'success',
                results: colors.length,
                data: {
                    colors
                }
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }
    }

    public updateColor = async(req:Request, res:Response) => {

        try{
   
            const color = await Color.findById(req.params.id);

            if (!color) return res.status(404).json({ status: 'fail', message: 'No color found with that ID' });

            const updatedColor = await Color.findByIdAndUpdate(req.params.id, {
                name: req.body.title,
                hex: req.body.hex
            }, {
                new: true,
                runValidators: true
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    updatedColor
                }
            })

        }catch(err:any){

            return res.status(404).json({
                status: 'fail',
                message: err.message
            })

        }

    }

    public deleteColor = async(req:Request, res:Response) => {
        
        try{
            const color = await Color.findByIdAndUpdate(req.params.id, {deletedAt: new Date()});

            if (!color) return res.status(404).json({ status: 'fail', message: 'No color found with that ID' });

            return res.status(204).json({
                status: 'success',
                data: null
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No color found with that ID'
            })
        }

    }

    public getColor = async(req:Request, res:Response) => {
        try{

            const size = await Color.findById(req.params.id);

            if (!size) return res.status(404).json({ status: 'fail', message: 'No color found with that ID' });

            return res.status(200).json({
                status: 'success',
                data: size
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No color found with that ID'
            })
        }
    }

}