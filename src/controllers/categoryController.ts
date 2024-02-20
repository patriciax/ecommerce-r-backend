import { Request, Response } from 'express'
import {Category} from './../models/category.schema'
import { digitalOceanDelete, digitalOceanUpload } from '../utils/digitalOceanSpaces'
// import cloudinary from 'cloudinary'
import { APIFeatures } from '../utils/apiFeatures'
import { maxImagesCount } from "../utils/maxImagesCount"; 
import slugify from 'slugify'; 
import { Product } from '../models/product.schema';

export class CategoryController {

    private validateFormCreate = (req:Request) => {

        const errors = []

        if(!req.body.title) errors.push('Nombre de categoría es requerido')
        if(!req.body.titleEnglish) errors.push('Nombre de categoría en inglés es requerido')
        if(!req.body.categoryType) errors.push('Tipo de categoría es requerido')
        // if(!req.body.mainImage) errors.push('Imagen es requerida')

        return errors

    }

    private validateFormUpdate = (req:Request) => {

        const errors = []

        if(!req.body.title) errors.push('Nombre de categoría es requerido')
        if(!req.body.titleEnglish) errors.push('Nombre de categoría en inglés es requerido')
        if(!req.body.categoryType) errors.push('Tipo de categoría es requerido')

        return errors

    }

    public createCategory = async(req:Request, res:Response) : Promise<any> => {

        //let mainImagePath:any = null

        try{
            
            const errors = this.validateFormCreate(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

            // const images:Array<String> = []
        
            // let base64Image = req.body.mainImage.split(';base64,').pop();

            // mainImagePath = await digitalOceanUpload(base64Image)

            let slug = `${req.body.title}`
            const results = await Category.find({slug: slug})
            if(results.length > 0) {
                slug = `${slug}-${Date.now()}`
            }
            slug = slugify(slug, {lower: true})
            const category = await Category.create({
                name: req.body.title,
                englishName: req.body.titleEnglish,
                //image: `${process.env.CDN_ENDPOINT}/${mainImagePath}`,
                categoryType: req.body.categoryType,
                parent_id: req.body.categoryParent  || undefined,
                slug: slug
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

    public categories = async(req:Request, res:Response) : Promise<any> => {
            
        try{
            const features = new APIFeatures(Category.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            const categories = await features.query

            const totalCategories = await Category.find();
            const totalPages = totalCategories.length / Number(req?.query?.limit || 1);
            
            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
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

    public updateCategory = async(req:Request, res:Response) => {

        try{

            const errors = this.validateFormUpdate(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

            //let mainImagePath:any = null    
            const category = await Category.findById(req.params.id);

            if (!category) return res.status(404).json({ status: 'fail', message: 'No category found with that ID' });
            // mainImagePath = category.image;

            // if (req.body.mainImage) {
            //     let base64Image = req.body.mainImage.split(';base64,').pop();
            //     mainImagePath = await digitalOceanUpload(base64Image);
            //     digitalOceanDelete(category?.image?.split('/').pop() || '');
            // }

            const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
                name: req.body.title,
                englishName: req.body.titleEnglish,
                //image: `${process.env.CDN_ENDPOINT}/${mainImagePath}`,
                categoryType: req.body.categoryType,
                parent_id: req.body.categoryParent  || undefined,
            }, {
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
            const category = await Category.findByIdAndUpdate(req.params.id, {deletedAt: new Date()});

            if (!category) return res.status(404).json({ status: 'fail', message: 'No category found with that ID' });

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