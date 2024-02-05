import { Request, Response } from 'express'
import {Product} from './../models/product.schema'
import cloudinary from 'cloudinary'
import { APIFeatures } from '../utils/apiFeatures'
import { maxImagesCount } from "../utils/maxImagesCount";  
import AWS from "aws-sdk";
import fs from "fs/promises";

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
            const mimeType = this.decodeBase64mimetype(base64Image) 
            const fileName = Date.now()

            await fs.writeFile(`uploads/${fileName}.${mimeType}`, base64Image, {encoding: 'base64'});
            const file = await fs.readFile(`uploads/${fileName}.${mimeType}`);
            mainImagePath = await this.digitalOceanSpaces(file, fileName.toString(), mimeType);

            for(let i = 0; i < req.body.images.length; i++) {
                const image = req.body.images[i];
                let base64Image = req.body.mainImage.split(';base64,').pop();
                let mimeType = this.decodeBase64mimetype(base64Image) 
                let fileName = Date.now()

                await fs.writeFile(`uploads/${fileName}.${mimeType}`, base64Image, {encoding: 'base64'});
                const file = await fs.readFile(`uploads/${fileName}.${mimeType}`);

                const imagePath: any = await this.digitalOceanSpaces(file, fileName.toString(), mimeType);
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

    cloudinaryImageUploadMethod = async (file: any) => {
        return new Promise(resolve => {
            cloudinary.v2.uploader.upload(file, (_err: any, res: any) => {
            resolve({
              res: res.secure_url,
            })
          })
        })
    }

    private uploadDataPromise = async (file: any, name:string, mimetype: string) => {

        const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT || '');
        const s3 = new AWS.S3({endpoint: spacesEndpoint, accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});

        return new Promise((resolve, reject)=> {
            s3.putObject({Bucket: process.env.DO_SPACES_NAME || '', Key: name, Body: file, ACL: "public-read"}, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        })

        
    }

    digitalOceanSpaces = async (file: any, name:string, mimetype:string) => {

        await this.uploadDataPromise(file, name, mimetype);
        return `${name}`

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
                mainImagePath = await this.cloudinaryImageUploadMethod(mainImage.path);
                req.body.mainImage = mainImagePath.res;
            }

            if(req.files && 'images' in req.files) {
                for(let i = 0; i < req.files['images'].length; i++) {
                    const imagePath: any = await this.cloudinaryImageUploadMethod(req.files['images'][i].path);
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