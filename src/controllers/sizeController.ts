import { Request, Response } from 'express'
import {Size} from '../models/size.schema'
import { APIFeatures } from '../utils/apiFeatures'

export class SizeController {

    private validateForm = (req:Request) => {

        const errors = []

        if(!req.body.title) errors.push('Nombre de la talla es requerido')
        if(!req.body.titleEnglish) errors.push('Nombre de la talla en inglés es requerido')

        return errors

    }

    public createSize = async(req:Request, res:Response) : Promise<any> => {

        try{

            const errors = this.validateForm(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

            const size = await Size.create({
                name: req.body.title,
                englishName: req.body.titleEnglish
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
            const features = new APIFeatures(Size.find(), req.query).paginate()
            const sizes = await features.query

            const totalSizes = await Size.find();
            const totalPages = totalSizes.length / Number(req?.query?.limit || 1);
            
            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
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
            
            const errors = this.validateForm(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

            const category = await Size.findById(req.params.id);

            if (!category) return res.status(404).json({ status: 'fail', message: 'No size found with that ID' });

            const updatedSize = await Size.findByIdAndUpdate(req.params.id, {
                name: req.body.title,
                englishName: req.body.titleEnglish
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