import { Request, Response } from "express";
import { User } from "../models/user.schema";
import { sign } from "jsonwebtoken";
import { Role } from "../models/role.schema";

export class LoginController {

    async login(req: Request, res: Response){

        try{

            const user = await User.findOne({email: req.body.email}).select({'_id':String, 'password':String, 'name':String, 'role':String, }).populate('role')
            if(!user){
                return res.status(404).json({
                    status: 'fail',
                    message: 'USER_NOT_FOUND'
                })
            }

            const isPasswordValid = await user.verifyUserPassword(req.body.password)
            if(!isPasswordValid){
                return res.status(404).json({
                    status: 'fail',
                    message: 'USER_NOT_FOUND'
                })
            }

            if(!user.emailVerifiedAt){
                return res.status(404).json({
                    status: 'fail',
                    message: 'EMAIL_NOT_VERIFIED'
                })
            }

            const {_id} = user.toObject()
            const token = sign({_id}, process.env.JWT_SECRET as string, {expiresIn: '2y'})

            return res.status(200).json({
                status: 'success',
                data: token
            })

        }catch(err:any){

            return res.status(500).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })

        }

    }

}