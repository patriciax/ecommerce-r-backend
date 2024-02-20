import { Request, Response } from "express";
import { User } from "../models/user.schema";
import { Role } from "../models/role.schema";
import { APIFeatures } from "../utils/apiFeatures";

export class UserController{

    private validateFormCreate =  (req:Request) => {
            
            const errors = []
    
            if(!req.body.name) errors.push('Nombre es requerido')
            if(!req.body.email) errors.push('Email es requerido')
            if(!req.body.password) errors.push('Contraseña es requerida')
    
            return errors
    }

    private validateFormUpdate =  (req:Request) => {
            
        const errors = []

        if(!req.body.name) errors.push('Nombre es requerido')

        return errors
}

    public updateProfile = async(req:Request, res: Response) => {

        try{

            await User.findByIdAndUpdate(req.user._id, {
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

            const user = await User.findById(req.user._id).select('-password -__v -_id').select('role').populate('role');

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

            const errors = this.validateFormCreate(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

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

            const features = new APIFeatures(User.find({role: role?._id}), req.query).paginate()
            const users = await features.query

            const totalEmployees = await User.find({role: role?._id});
            const totalPages = totalEmployees.length / Number(req?.query?.limit || 1);
            
            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
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

            const employeeToDelete = await User.findById(req.params.id);

            const employee = await User.findByIdAndUpdate(req.params.id, {
                email: `${employeeToDelete?.email}-${Date.now()}`,
                deletedAt: new Date()
            });

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
            
            const errors = this.validateFormUpdate(req)
            if(errors.length > 0) return res.status(422).json({ status: 'fail', message: errors })

            const employee = await User.findById(req.params.id);

            if (!employee) return res.status(404).json({ status: 'fail', message: 'No employee found with that ID' });

            employee.name = req.body.name;
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

    public verifyRepeatedEmail = async (req:Request, res:Response) => {

        try{

            const user = await User.findOne({email: req.body.email});

            if(user) 
                return res.status(200).json({
                    "status": "success",
                    "message": "EMAIL_ALREADY_EXISTS"
                })

            return res.status(404).json({
                "status": "fail",
                "message": "USER_NOT_FOUND"
            })

        }catch(err){
            return res.status(500).json({
                "status": "error",
                "message": "SOMETHING_WENT_WRONG"
            })
        }

    }

}