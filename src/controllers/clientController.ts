import { Request, Response } from "express";
import { User } from "../models/user.schema";
import { Role } from "../models/role.schema";
import { APIFeatures } from "../utils/apiFeatures";

export class ClientController{

    clients = async(req:Request, res: Response) => {

        try{

            const role = await Role.findOne({name: "CUSTOMER"});

            const features = new APIFeatures(User.find({role: role?._id}), req.query).paginate()
            const clients = await features.query

            const totalEmployees = await User.find({role: role?._id});
            const totalPages = totalEmployees.length / Number(req?.query?.limit || 1);
            
            return res.status(200).json({
                status: 'success',
                totalPages: Math.ceil(totalPages),
                results: clients.length,
                data: {
                    clients
                }
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }

    }

}