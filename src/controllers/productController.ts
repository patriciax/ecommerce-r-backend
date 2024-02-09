import { Request, Response } from 'express'
import {Product} from './../models/product.schema'
import { APIFeatures } from '../utils/apiFeatures'
import { maxImagesCount } from "../utils/maxImagesCount";  
import AWS from "aws-sdk";
import fs from "fs/promises";
import { digitalOceanUpload } from '../utils/digitalOceanSpaces';

export class ProductController {

    private decodeBase64mimetype = (base64:string) =>{
        const signatures:any = {
            JVBERi0: 'pdf',
            R0lGODdh: 'gif',
            R0lGODlh: 'gif',
            iVBORw0KGgo: 'png',
            '/9j/': 'jpg',
        };
        

        for(const sign in signatures)
            if(base64.startsWith(sign))
                return signatures[sign];
        
    }

    public createProduct = async(req:Request, res:Response) : Promise<any> => {

        let mainImagePath:any = null

        try{
        
            const images:Array<String> = []
        
            let base64Image = req.body.mainImage.split(';base64,').pop();
            mainImagePath = await digitalOceanUpload(base64Image)
            
            for(let i = 0; i < req.body.images.length; i++) {
                const image = req.body.images[i];
                let base64Image = image.split(';base64,').pop();

                const imagePath: any = await digitalOceanUpload(base64Image)
                images.push(`${process.env.CDN_ENDPOINT}/${imagePath}`);
            }
            
            const product = await Product.create({
                name: req.body.title,
                description: req.body.description,
                stock: req.body.stock,
                price: req.body.price,
                mainImage: `${process.env.CDN_ENDPOINT}/${mainImagePath}`,
                images: images
            })

            return res.status(201).json({
                status: 'success',
                data: product
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }

    }

    public products = async(req:Request, res:Response) : Promise<any> => {
            
        try{
            const features = new APIFeatures(Product.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            const products = await features.query
            
            return res.status(200).json({
                status: 'success',
                results: products.length,
                data: {
                    products
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
            const product = await Product.findById(req.params.id);

            if (!product) return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });
            mainImagePath = product.mainImage;

            const productImages = product.images;

            if (req.files && 'images' in req.files) {
                if (productImages.length + req.files['images'].length > maxImagesCount) {
                    return res.status(400).json({ status: 'fail', message: 'You can only have 3 images per product' });
                }
            }

            if (req.files && 'mainImage' in req.files) {
                const mainImage = req.files['mainImage'][0] as Express.Multer.File;
                mainImagePath = "" //await this.cloudinaryImageUploadMethod(mainImage.path);
                req.body.mainImage = mainImagePath.res;
            }

            if(req.files && 'images' in req.files) {
                for(let i = 0; i < req.files['images'].length; i++) {
                    const imagePath: any = "" //await this.cloudinaryImageUploadMethod(req.files['images'][i].path);
                    newImages.push(imagePath.res);
                }
                req.body.images = newImages;
            }
                        
            const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    updatedProduct
                }
            })

        }catch(err:any){

            return res.status(404).json({
                status: 'fail',
                message: err.message
            })

        }

    }

    public deleteSecondaryImage = async(req:Request, res:Response) => {

        try{

            const product = await Product.findById(req.params.id);

            if (!product) return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });

            const productImages = product.images;

            if(productImages.length <= 0) {
                return res.status(400).json({ status: 'fail', message: 'There are no secondary images to delete' });
            }

            const secondaryImages = productImages.filter((image: any) => image !== req.body.image);

            product.images = secondaryImages;
            product.save();

            return res.status(200).json({
                status: 'success',
                data: {
                    product
                }
            })

        }catch(err:any){

            return res.status(404).json({
                status: 'fail',
                message: err.message
            })

        }

    }

    public deleteProduct = async(req:Request, res:Response) => {
        
        try{

            const product = await Product.findByIdAndDelete(req.params.id);

            if (!product) return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });

            return res.status(204).json({
                status: 'success',
                data: null
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No product found with that ID'
            })
        }

    }

    public getProduct = async(req:Request, res:Response) => {
        try{

            const product = await Product.findById(req.params.id);

            if (!product) return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });

            return res.status(200).json({
                status: 'success',
                data: product
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No product found with that ID'
            })
        }
    }

}