import { Request, Response } from "express";
import { Footer } from "../models/footer.schema";
import slugify from "slugify";

export class FooterController {

    public async getItemBySlug(req:Request, res:Response) {

        try{

            const findSlug = await Footer.findOne({slug: req.params.slug})
            console.log(findSlug)
            if(!findSlug){
                return res.status(404).json({
                    status: 'fail'
                });
            }

            return res.status(200).json({
                status: 'success',
                data: findSlug
            })

        }catch(error){

        }

    }
  
    public async createFooter(req:Request, res:Response) {

        try{

            let slug = slugify(req.body.title, {lower: true})

            const findSlug = await Footer.findOne({slug: slug})

            if(findSlug){
                slug = slug + '-' + Date.now()
            }

            const footer = await Footer.create({
                title: req.body.title,
                titleEnglish: req.body.titleEnglish,
                description: req.body.description,
                descriptionEnglish: req.body.descriptionEnglish,
                section: req.body.section,
                slug
            });

            return res.status(201).json({
                status: 'success',
                data: footer
            });

        }catch(error){
            console.error(error);
            return res.status(500).json({
                status: 'error',
            });
        }

    }

    public async list(req:Request, res:Response) {

        try{

            const footer = await Footer.find({section: req.params.section});

            return res.status(200).json({
                status: 'success',
                data: footer
            });

        }catch(error){

            return res.status(500).json({status: 'error'});
        }

    }

    public async deleteItem(req:Request, res:Response) {

        try{

            const footer = await Footer.findById(req.params.footer);

            if(!footer){
                return res.status(404).json({
                    status: 'fail'
                });
            }

            await Footer.findByIdAndDelete(req.params.footer);

            return res.status(201).json({
                status: 'success'
            });

        }catch(error){
            console.error(error);
            return res.status(500).json({status: 'error'});
        }

    }

    public async getItem(req:Request, res:Response) {
        try{

            const footer = await Footer.findById(req.params.footer);

            if(!footer){
                return res.status(404).json({
                    status: 'fail'
                });
            }

            return res.status(200).json({
                status: 'success',
                data: footer
            });

        }catch(error){
            console.error(error);
            return res.status(500).json({status: 'error'});
        }
    }

    public async updateItem(req:Request, res:Response) {
        try{

            const footer = await Footer.findById(req.params.footer);

            if(!footer){
                return res.status(404).json({
                    status: 'fail'
                });
            }

            const updatedFooter = await Footer.findByIdAndUpdate(req.params.footer, {
                title: req.body.title,
                titleEnglish: req.body.titleEnglish,
                description: req.body.description,
                descriptionEnglish: req.body.descriptionEnglish
            });

            return res.status(200).json({
                status: 'success',
                data: updatedFooter
            });

        }catch(error){
            console.error(error);
        }
    }

    public async getItemStore(req:Request, res:Response) {
        try{

            const footer = await Footer.find({});

            if(!footer){
                return res.status(404).json({
                    status: 'fail'
                });
            }

            return res.status(200).json({
                status: 'success',
                data: footer
            });
            
        }catch(error){
            console.error(error);
            return res.status(500).json({status: 'error'});
        }
    }

}