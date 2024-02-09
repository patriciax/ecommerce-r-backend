import { Request, Response } from 'express'
import {Category} from './../models/category.schema'
import { digitalOceanUpload } from '../utils/digitalOceanSpaces'
import cloudinary from 'cloudinary'
import { APIFeatures } from '../utils/apiFeatures'
import { maxImagesCount } from "../utils/maxImagesCount";  

export class CategoryController {

    public createCategory = async(req:Request, res:Response) : Promise<any> => {

        let mainImagePath:any = null

        try{
        
            const images:Array<String> = []
        
            let base64Image = req.body.mainImage.split(';base64,').pop();

            mainImagePath = await digitalOceanUpload(base64Image)
            
            const category = await Category.create({
                name: req.body.title,
                image: `${process.env.CDN_ENDPOINT}/${mainImagePath}`,
            })

            return res.status(201).json({
                status: 'success',
                data: category
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }

    }

    cloudinaryImageUploadMethod = async (file: any) => {
        return new Promise(resolve => {
            cloudinary.v2.uploader.upload(file, (_err: any, res: any) => {
            resolve({
              res: res.secure_url,
            })
          })
        })
    }


    public categories = async(req:Request, res:Response) : Promise<any> => {
            
        try{
            const features = new APIFeatures(Category.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            const categories = await features.query
            
            return res.status(200).json({
                status: 'success',
                results: categories.length,
                data: {
                    categories
                }
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }
    }

    public updateProduct = async(req:Request, res:Response) => {

        try{

            let mainImagePath:any = null    
            const newImages:Array<String> = []
            const category = await Category.findById(req.params.id);

            if (!category) return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });
            mainImagePath = category.image;

            if (req.files && 'mainImage' in req.files) {
                const mainImage = req.files['mainImage'][0] as Express.Multer.File;
                mainImagePath = await this.cloudinaryImageUploadMethod(mainImage.path);
                req.body.mainImage = mainImagePath.res;
            }

            
            const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    updatedCategory
                }
            })

        }catch(err:any){

            return res.status(404).json({
                status: 'fail',
                message: err.message
            })

        }

    }

    public deleteCategory = async(req:Request, res:Response) => {
        
        try{

            const product = await Category.findByIdAndUpdate(req.params.id, {deletedAt: new Date()});

            if (!product) return res.status(404).json({ status: 'fail', message: 'No category found with that ID' });

            return res.status(204).json({
                status: 'success',
                data: null
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No category found with that ID'
            })
        }

    }

    public getCategory = async(req:Request, res:Response) => {
        try{

            const category = await Category.findById(req.params.id);

            if (!category) return res.status(404).json({ status: 'fail', message: 'No category found with that ID' });

            return res.status(200).json({
                status: 'success',
                data: category
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No product found with that ID'
            })
        }
    }

}