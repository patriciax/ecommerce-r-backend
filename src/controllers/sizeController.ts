import { Request, Response } from 'express'
import {Size} from '../models/size.schema'
import { APIFeatures } from '../utils/apiFeatures'

export class SizeController {

    public createSize = async(req:Request, res:Response) : Promise<any> => {

        try{
            
            const size = await Size.create({
                name: req.body.title,
            })

            return res.status(201).json({
                status: 'success',
                data: size
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }

    }

    public sizes = async(req:Request, res:Response) : Promise<any> => {
            
        try{
            const features = new APIFeatures(Size.find(), req.query)
            const sizes = await features.query
            
            return res.status(200).json({
                status: 'success',
                results: sizes.length,
                data: {
                    sizes
                }
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }
    }

    public updateSize = async(req:Request, res:Response) => {

        try{
   
            const category = await Size.findById(req.params.id);

            if (!category) return res.status(404).json({ status: 'fail', message: 'No size found with that ID' });

            const updatedSize = await Size.findByIdAndUpdate(req.params.id, {
                name: req.body.title,
            }, {
                new: true,
                runValidators: true
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    updatedSize
                }
            })

        }catch(err:any){

            return res.status(404).json({
                status: 'fail',
                message: err.message
            })

        }

    }

    public deleteSize = async(req:Request, res:Response) => {
        
        try{
            const size = await Size.findByIdAndUpdate(req.params.id, {deletedAt: new Date()});

            if (!size) return res.status(404).json({ status: 'fail', message: 'No size found with that ID' });

            return res.status(204).json({
                status: 'success',
                data: null
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No size found with that ID'
            })
        }

    }

    public getSize = async(req:Request, res:Response) => {
        try{

            const size = await Size.findById(req.params.id);

            if (!size) return res.status(404).json({ status: 'fail', message: 'No size found with that ID' });

            return res.status(200).json({
                status: 'success',
                data: size
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No size found with that ID'
            })
        }
    }

}