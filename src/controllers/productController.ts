import { Request, Response } from 'express'
import {Product} from './../models/product.schema'
import { APIFeatures } from '../utils/apiFeatures'
import { maxImagesCount } from "../utils/maxImagesCount";  
import { digitalOceanDelete, digitalOceanUpload } from '../utils/digitalOceanSpaces';
import slugify from 'slugify';
import { Category } from '../models/category.schema';
import { Size } from '../models/size.schema';
import { Color } from '../models/color.schema';

export class ProductController {

    private validateFormCreate =  (req:Request) => {
                
        const errors = []

        if(!req.body.title) errors.push('Titulo es requerido')
        if(!req.body.titleEnglish) errors.push('Titulo en inglés es requerido')
        if(!req.body.description) errors.push('Descripción es requerido')
        if(!req.body.descriptionEnglish) errors.push('Descripcion en inglés es requerida')
        if(!req.body.price) errors.push('Price es requerido')
        if(!req.body.categories) errors.push('Price es requerido')
        if(!req.body.mainImage) errors.push('Imágen principal es requerida')
        if(!req.body.productVariations) errors.push('Variaciones del producto es requerido')
        if(!req.body.length) errors.push('Largo del producto es requerido') 
        if(!req.body.width) errors.push('Ancho del producto es requerido')
        if(!req.body.height) errors.push('Alto del producto es requerido')
        if(!req.body.weight) errors.push('Peso del producto es requerido')     

        return errors
    }

    private validateFormUpdate =  (req:Request) => {
                
        const errors = []

        if(!req.body.name) errors.push('Titulo es requerido')
        if(!req.body.nameEnglish) errors.push('Titulo en inglés es requerido')
        if(!req.body.description) errors.push('Descripción es requerido')
        if(!req.body.descriptionEnglish) errors.push('Descripcion en inglés es requerida')
        if(!req.body.price) errors.push('Price es requerido')
        if(!req.body.categories) errors.push('Price es requerido')
        if(!req.body.productVariations) errors.push('Variaciones del producto es requerido')
        if(!req.body.length) errors.push('Largo del producto es requerido') 
        if(!req.body.width) errors.push('Ancho del producto es requerido')
        if(!req.body.height) errors.push('Alto del producto es requerido')
        if(!req.body.weight) errors.push('Peso del producto es requerido')

        return errors
    }

    private replaceAccents(str:string) {
        return str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    private setTags = async (tags:any) => {

        const excludeWords = ["de", "para", "y", "en", "con", "la", "el", "los", "las", "un", "una", "unos", "unas", "es", "son", "al", "del", "por", "lo", "como", "mas", "muy", "sobre", "bajo", "entre", "hacia", "desde", "hasta", "ante", "tras", "durante", "segun", "sin", "sino", "si", "no", "ni", "tambien", "ademas", "aunque", "pero", "of", "for", "and", "in", "with", "the", "the", "the", "the", "a", "an", "somes", "somes", "is", "are", "at", "of", "for", "lo", "as", "more", "very", "about", "under", "between", "towards", "from", "until", "before", "after", "during", "according to", "without", "but", "if", "no", "nor", "also ", "in addition", "although", "but"]
        
        
        const finalTags: string[] = [];
        const categories = await Category.find({"_id" : { $in : tags.categories}})
        const sizes = await Size.find({"_id" : { $in : tags.sizes}})
        const colors = await Color.find({"_id" : { $in : tags.colors}})

        if(categories){
            categories.forEach((category:any) => {
                category.name.split(' ').forEach((word:any) => {
                    if(!excludeWords.includes(this.replaceAccents(word))) finalTags.push(this.replaceAccents(word?.toLowerCase()))
                })
                category.englishName.split(' ').forEach((word:any) => {
                    if(!excludeWords.includes(this.replaceAccents(word))) finalTags.push(this.replaceAccents(word?.toLowerCase()))
                })
            })
        }

        if(sizes){
            sizes.forEach((size:any) => {
                
                if(!excludeWords.includes(this.replaceAccents(size.name))) finalTags.push(this.replaceAccents(size.name?.toLowerCase()))
                if(!excludeWords.includes(this.replaceAccents(size.englishName))) finalTags.push(this.replaceAccents(size.englishName?.toLowerCase()))
                
            })
        }

        if(colors){
            colors.forEach((color:any) => {
                
                if(!excludeWords.includes(this.replaceAccents((color.name)))) finalTags.push(this.replaceAccents(color.name?.toLowerCase()))
                if(!excludeWords.includes(this.replaceAccents(color.englishName))) finalTags.push(this.replaceAccents(color.englishName?.toLowerCase()))
                
            })
        }

        tags.name.split(' ').forEach((word:any) => {
            if(!excludeWords.includes(this.replaceAccents(word))) finalTags.push(this.replaceAccents(word?.toLowerCase()))
        })

        tags.nameEnglish.split(' ').forEach((word:any) => {
            if(!excludeWords.includes(this.replaceAccents(word))) finalTags.push(this.replaceAccents(word?.toLowerCase()))
        })

        return finalTags

    }

    public createProduct = async(req:Request, res:Response) : Promise<any> => {

        let mainImagePath:any = null

        try{
            
            const errors = this.validateFormCreate(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

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
            const results = await Product.find( 
                {
                    $or: [
                        { deletedAt: null },
                        { deletedAt: { $ne: null } }
                    ]
                },
                {slug: slug})


            if(results.length > 0) {
                slug = `${slug}-${Date.now()}`
            }
            slug = slugify(slug, {lower: true})

            const fieldsToTag = {
                categories: req.body.categories.map((category: any) => category.id),
                name: req.body.title,
                nameEnglish: req.body.titleEnglish,
            }

            const tags = await this.setTags(fieldsToTag)

            const product = await Product.create({
                categories: req.body.categories.map((category: any) => category.id),
                name: req.body.title,
                nameEnglish: req.body.titleEnglish,
                description: req.body.description,
                descriptionEnglish: req.body.descriptionEnglish,
                price: req.body.price,
                priceDiscount: req.body.priceDiscount,
                mainImage: `${process.env.CDN_ENDPOINT}/${mainImagePath}`,
                images: images,
                showInHomeSection: req.body.showInHomeSection,
                slug: slug,
                productVariations: req.body.productVariations,
                tags: tags,
                length: req.body.length,
                width: req.body.width,
                height: req.body.height,
                weight: req.body.weight
            })

            return res.status(201).json({
                status: 'success',
                data: product
            })

        }
        catch(err: any){
            console.log(err)
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

            const errors = this.validateFormUpdate(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

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

            const fieldsToTag = {
                categories: req.body.categories.map((category: any) => category.id ?? category),
                name: req.body.name,
                nameEnglish: req.body.nameEnglish
            }

            const tags = await this.setTags(fieldsToTag)

            const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
                showInHomeSection: req.body.showInHomeSection,
                categories: req.body.categories.map((category: any) => category.id ?? category),
                name: req.body.name,
                nameEnglish: req.body.nameEnglish,
                description: req.body.description,
                descriptionEnglish: req.body.descriptionEnglish,
                stock: req.body.stock,
                price: req.body.price,
                priceDiscount: req.body.priceDiscount,
                mainImage: req.body.mainImage ? `${process.env.CDN_ENDPOINT}/${mainImagePath}` : product.mainImage,
                images: req.body.images.length > 0 ? images : product.images,
                productVariations: req.body.productVariations,
                length: req.body.length,
                width: req.body.width,
                height: req.body.height,
                weight: req.body.weight
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

        let product = null
        try{
            
            product = await Product.findOne({_id: req.params.id}).populate('productVariations.size')
            .populate('productVariations.color');

            return res.status(200).json({
                status: 'success',
                data: product
            })

        }catch(err){

            try{

                if(!product) product = await Product.findOne({slug: req.params.id}).populate('productVariations.size').populate('productVariations.color');

                if (!product) return res.status(404).json({ status: 'fail', message: 'No product found with that ID' });

                return res.status(200).json({
                    status: 'success',
                    data: product
                })

            }catch(error){
                return res.status(404).json({
                    status: 'fail',
                    message: 'No product found with that ID'
                })       
            }

        }
    }

    public productInHome = async(req:Request, res:Response) => {
        try{

            const section1Products = await Product.find({showInHomeSection: 'section-1'}).sort({'createdAt': -1}).limit(12);
            const section2Products = await Product.find({showInHomeSection: 'section-2'}).sort({'createdAt': -1}).limit(20);
            const section3Products = await Product.find({showInHomeSection: 'section-3'}).sort({'createdAt': -1}).limit(12);

            return res.status(200).json({
                status: 'success',
                data: {
                    "section1": section1Products,
                    "section2": section2Products,
                    "section3": section3Products
                }
            })

        }catch(err:any){
            return res.status(404).json({
                status: 'fail',
                message: err.message
            })
        }
    }

    public dailySaleProducts = async(req:Request, res:Response) => {
        try{

            const features = new APIFeatures(Product.find({ priceDiscount: { $ne: 0 } }
                ), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            const products = await features.query

            const productFeatures = new APIFeatures(Product.find({ priceDiscount: { $ne: 0 } }
                ), req.query)
            .filter()
            .sort()
            .limitFields()
            
            const totalProducts = await productFeatures.query;
            const totalPages = totalProducts.length / Number(req?.query?.limit || 1);
            
            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
                results: products.length,
                data: {
                    products
                }
            })

        }catch(err:any){
            return res.status(404).json({
                status: 'fail',
                message: err.message
            })
        }
    }

    public searchProducts = async(req:Request, res:Response) => {

        try{

            const textSearch = this.replaceAccents(req.body.textSearch.toLowerCase())
            const splittedText = textSearch.split(' ')
            const categories = req.body.categories

            const data = {
                tags: { $in: splittedText },
                categories: categories?.length > 0 ? { $in: categories } : { $exists: true }
            }

            const features = new APIFeatures(Product.find(
                data
            ), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            const products = await features.query

            const totalProducts = await Product.find(data);
            const totalPages = totalProducts.length / Number(req?.query?.limit || 1);

            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
                results: products.length,
                data: {
                    products
                }
            })

        }catch(err:any){

            console.log(err)

            return res.status(404).json({
                status: 'fail',
                message: 'PRODUCT_NOT_FOUND'
            })
        }

    }

    public productsByCategory = async(req:Request, res:Response) => {
        try{

            const features = new APIFeatures(Product.find({ categories: { $in: [req.params.categoryId] } }), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()
            const products = await features.query

            const totalProducts = await Product.find({ categories: { $in: [req.params.categoryId] } });
            const totalPages = totalProducts.length / Number(req?.query?.limit || 1);
            
            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
                results: products.length,
                data: {
                    products
                }
            })

        }catch(err:any){
            return res.status(404).json({
                status: 'fail',
                message: err.message
            })
        }
    }

}