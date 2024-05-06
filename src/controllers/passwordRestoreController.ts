import { Request, Response } from "express";
import { User } from "../models/user.schema";
import { otpCreator } from "../utils/otpCreator";
import { EmailController } from "./emailController";

export class PasswordRestoreController {

    public setRestorePasswordOtp = async(req: Request, res: Response) => {

        try{

            const otp = otpCreator()
            const user = await User.findOneAndUpdate({email: req.body.email}, {passwordResetOtp: otp}).select({passwordResetOtp: 1, name: 1, email: 1})
            if(!user){
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                })
            }

            const emailController = new EmailController()
            emailController.sendEmail("emailPasswordReset", user.email, "Password reset", {
                name: user.name,
                emailOtp: otp
            })

            return res.status(200).json({
                status: 'success',
                message: 'Password reset otp sent to email'
            })

        }catch(error:any){
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            })
        }

    }

    public verifyPasswordOtp = async(req: Request, res: Response) => {

        try{

            const user = await User.findOne({email: req.body.email, passwordResetOtp: req.body.passwordOtp})
            if(!user){
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                })
            }

            return res.status(200).json({
                status: 'success',
                message: 'Otp verified'
            })

        }catch(error:any){
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            })
        }

    }

    public updatePassword = async(req: Request, res: Response) => {

        try{

            const user = await User.findOne({email: req.body.email, passwordResetOtp: req.body.passwordOtp})

            if(!user){
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                })
            }

            user.passwordResetOtp = undefined
            user.password = req.body.password
            user.save()

            return res.status(200).json({
                status: 'success',
                message: 'Passowrd updated successfully'
            })

        }catch(error:any){
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            })
        }

    }

}