import { Request, Response } from 'express'
import {Color} from '../models/color.schema'
import { APIFeatures } from '../utils/apiFeatures'
import { Newsletter } from '../models/newsletter.schema'
import { User } from '../models/user.schema'
import { EmailController } from './emailController'
import { Role } from '../models/role.schema'

export class NewsletterController {

    private validateForm = (req:Request) => {

        const errors = []

        if(!req.body.title) errors.push('Nombre del color es requerido')
        if(!req.body.description) errors.push('Nombre del color en inglés es requerido')
        return errors

    }

    public createNewsletter = async(req:Request, res:Response) : Promise<any> => {

        try{

            const errors = this.validateForm(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

            const newsLetter = await Newsletter.create({
                title: req.body.title,
                description: req.body.description
            })

            return res.status(201).json({
                status: 'success',
                data: newsLetter
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }

    }

    public newsletters = async(req:Request, res:Response) : Promise<any> => {
            
        try{
            const features = new APIFeatures(Newsletter.find(), req.query).paginate();
            const newsletters = await features.query;

            const totalNewsletter = await Newsletter.find();
            const totalPages = totalNewsletter.length / Number(req?.query?.limit || 1);
            
            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
                results: newsletters.length,
                data: {
                    newsletters
                }
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }
    }

    public sendNewsletters = async() : Promise<any> => {
        
        try{
            
            const emailController = new EmailController();

            const role = await Role.findOne({role: "CUSTOMER"});
            const users = await User.find({role: role?._id});
            const newsletters = await Newsletter.find({sent: false});

            await Promise.all(newsletters.map(async (newsletter) => {
                await Promise.all(users.map(async (user) => {
                    
                    console.log(user.email, newsletter.title, newsletter.description)

                    emailController.sendEmail("newsletter", user.email, newsletter.title, {
                        title: newsletter.title,
                        name: `${user.name} ${user.lastname}`,
                        description: newsletter.description
                    })

                }));
              
                newsletter.sent = true;
                await newsletter.save();
            }));

        }
        catch(err: any){
            console.log(err);
        }
    }

}