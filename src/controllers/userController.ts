import { Request, Response } from "express";
import { User } from "../models/user.schema";
import { Role } from "../models/role.schema";
import { APIFeatures } from "../utils/apiFeatures";

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

    createEmployee = async(req:Request, res: Response) => {

        try{

            const role = await Role.findOne({name: "EMPLOYEE"});

            if(!role){
                return res.status(400).json({
                    "status": "fail",
                    "message": "Role not found"
                })
            }
        
            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                role: role._id
            });

            return res.status(201).json({
                "status": "success",
                "data": user
            })

        }catch(err){
            console.log(err)
            return res.status(400).json({
                "status": "fail",
                "message": "User not created"
            })
        }

    }

    employees = async(req:Request, res: Response) => {

        try{

            const role = await Role.findOne({name: "EMPLOYEE"});

            const features = new APIFeatures(User.find({role: role?._id}), req.query)
            const users = await features.query
            
            return res.status(200).json({
                status: 'success',
                results: users.length,
                data: {
                    users
                }
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }

    }

    public deleteEmployee = async(req:Request, res:Response) => {
        
        try{
            const employee = await User.findByIdAndUpdate(req.params.id, {deletedAt: new Date()});

            if (!employee) return res.status(404).json({ status: 'fail', message: 'No employee found with that ID' });

            return res.status(204).json({
                status: 'success',
                data: null
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No color found with that ID'
            })
        }

    }

    public employee = async(req:Request, res:Response) => {
        try{

            const user = await User.findById(req.params.id)

            if (!user) return res.status(404).json({ status: 'fail', message: 'No user found with that ID' });

            return res.status(200).json({
                status: 'success',
                data: user
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }
    }

    public updateEmployee = async(req:Request, res:Response) => {

        try{
   
            const employee = await User.findById(req.params.id);

            if (!employee) return res.status(404).json({ status: 'fail', message: 'No employee found with that ID' });

            employee.name = req.body.name;
            employee.email = req.body.email;
            if(req.body.password)
                employee.password = req.body.password;
            employee.save()

            return res.status(200).json({
                status: 'success',
                data: {
                    employee
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