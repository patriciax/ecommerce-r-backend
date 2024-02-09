import { Request, Response } from "express";
import { User } from "../models/user.schema";

export class UserController{

    public updateProfile = async(req:Request, res: Response) => {

        try{

            await User.findByIdAndUpdate(req.body.user._id, {
                name: req.body.name
            })
    
            return res.status(200).json({
                "status": "success",
                "message": "Profile updated successfully"
            })

        }catch(err){
            return res.status(200).json({
                "status": "fail",
                "message": "User not found"
            })
        }

    }

    public getUserInfo = async(req:Request, res: Response) => {

        try{

            const user = await User.findById(req.body.user._id).select('-password -__v -_id').select('role').populate('role');

            return res.status(200).json({
                "status": "success",
                "data": user
            })
        }catch(err){
            console.log(err)
            return res.status(200).json({
                "status": "fail",
                "message": "User not found"
            })
        }

    }

}