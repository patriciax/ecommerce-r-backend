import { Request, Response } from "express";
import { User } from "../models/user.schema";
import { Role } from "../models/role.schema";
import { EmailController } from "./emailController";
import { otpCreator } from "../utils/otpCreator";

export class RegisterController{

    public signup = async (req: Request, res: Response) => {

        try{
            
            const customerRole = await Role.findOne({name: 'CUSTOMER'})
            req.body.role = customerRole?._id
            const emailOtpToCreate = otpCreator()

            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                emailOtp: emailOtpToCreate,
            });

            const {password, emailOtp, role, ...data} = user.toJSON()

            const emailController = new EmailController()
            emailController.sendEmail("emailVerify", user.email, "Email verification", {
                name: user.name,
                emailOtp: user.emailOtp
            })

            return res.status(201).json({
                'status': 'success',
                'data': {
                    user:data
                }
            })

        }catch(error:any){

            return res.status(400).json({
                'status': 'error',
                'message': error.message
            })
        }

    }

    public resendEmailOtp = async (req: Request, res: Response) => {

        try{
            const emailController = new EmailController()
            const user = await User.findOne({email: req.body.email}).lean().select({emailOtp: 1, name: 1, email: 1})

            if(!user){
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                })
            }

            emailController.sendEmail("emailVerify", user.email, "Email verification", user)

            res.status(200).json({
                status: 'success',
                message: 'Email sent'
            })
        }catch(error:any){
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            })
        }

    }

    public verifyEmailOtp = async (req: Request, res: Response) => {

        try{

            const user = await User.findOneAndUpdate({email: req.body.email, emailOtp: req.body.emailOtp}, {emailOtp: undefined, emailVerifiedAt: Date.now()})
            if(!user){
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                })
            }

            return res.status(200).json({
                status: 'success',
                message: 'Email verified'
            })

        }catch(error:any){
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            })
        }

    }


}