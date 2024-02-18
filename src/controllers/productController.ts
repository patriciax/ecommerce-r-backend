import { Request, Response } from 'express'
import {Product} from './../models/product.schema'
import { APIFeatures } from '../utils/apiFeatures'
import { maxImagesCount } from "../utils/maxImagesCount";  
import { digitalOceanDelete, digitalOceanUpload } from '../utils/digitalOceanSpaces';
import slugify from 'slugify';

export class ProductController {

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

            let slug = `${req.body.title}`
            const results = await Product.find({slug: slug})
            if(results.length > 0) {
                slug = `${slug}-${Date.now()}`
            }
            slug = slugify(slug, {lower: true})

            const product = await Product.create({
                categories: req.body.categories.map((size: any) => size.id),
                sizes: req.body.sizes.map((size: any) => size.id),
                colors: req.body.colors.map((color: any) => color.id),
                name: req.body.title,
                nameEnglish: req.body.titleEnglish,
                description: req.body.description,
                descriptionEnglish: req.body.descriptionEnglish,
                stock: req.body.stock,
                price: req.body.price,
                priceDiscount: req.body.priceDiscount,
                mainImage: `${process.env.CDN_ENDPOINT}/${mainImagePath}`,
                images: images,
                slug: slug
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

            const totalProducts = await Product.find();
            const totalPages = totalProducts.length / Number(req?.query?.limit || 1);
            
            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
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
            
            const images:Array<String> = []
            
            if(req.body.mainImage) {
                let base64Image = req.body.mainImage.split(';base64,').pop();
                mainImagePath = await digitalOceanUpload(base64Image)
                digitalOceanDelete(product?.mainImage?.split('/').pop() || '');
            }
            
            if(req.body.images) {
                for(let i = 0; i < req.body.images.length; i++) {
                    const image = req.body.images[i];
                    let base64Image = image.split(';base64,').pop();
    
                    const imagePath: any = await digitalOceanUpload(base64Image)
                    images.push(`${process.env.CDN_ENDPOINT}/${imagePath}`);
                }
            }

            if(product.images.length + images.length > maxImagesCount) {
                return res.status(422).json({ status: 'fail', message: `You can only have ${maxImagesCount} images` });
            }

            product.images.forEach((image: any) => {
                images.push(image);
            })

            const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
                categories: req.body.categories.map((category: any) => category.id ?? category),
                sizes: req.body.sizes.map((size: any) => size.id ?? size),
                colors: req.body.colors.map((color: any) => color.id ?? color),
                name: req.body.name,
                nameEnglish: req.body.nameEnglish,
                description: req.body.description,
                descriptionEnglish: req.body.descriptionEnglish,
                stock: req.body.stock,
                price: req.body.price,
                priceDiscount: req.body.priceDiscount,
                mainImage: req.body.mainImage ? `${process.env.CDN_ENDPOINT}/${mainImagePath}` : product.mainImage,
                images: req.body.images.length > 0 ? images : product.images
            }, {
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

            const productImageToDelete = productImages.find(image => image.includes(req.params.imageId))
            digitalOceanDelete(productImageToDelete?.split('/').pop() || '');
            const secondaryImages = productImages.filter((image: any) => image !== productImages.find(image => image.includes(req.params.imageId)));
            
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

            const product = await Product.findByIdAndUpdate(req.params.id, {
                deletedAt: Date.now(),
            });

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