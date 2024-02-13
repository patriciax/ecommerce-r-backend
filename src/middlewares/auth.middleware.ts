import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { User } from "../models/user.schema";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    if(!req.headers.authorization){
        return res.status(401).json({
            status: 'fail',
            message: 'You are not authorized to access this resource'
        })
    }

    const splittedHeader = req.headers.authorization.split(' ')
    if(splittedHeader[0] !== 'Bearer'){
        return res.status(401).json({
            status: 'fail',
            message: 'You are not authorized to access this resource'
        })
    }

    try {
        const userInfo = verify(splittedHeader[1], process.env.JWT_SECRET as string) as JwtPayload;
        const user = await User.findById(userInfo._id).populate('role');

        if(!user){
            return res.status(401).json({
                status: 'fail',
                message: 'You are not authorized to access this resource'
            });
        }
        
        req.body.user = user;
        

    } catch (error: any) {
        return res.status(401).json({
            status: 'fail',
            message: 'You are not authorized to access this resource'
        });
    }

    next();
    

}

export const restrictsTo = (permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {

        if(!req.body.user?.role?.permissions.includes(permissions)){
            return res.status(403).json({
                status: 'fail',
                message: 'You are not allowed to access this resource'
            })
        }
        next();
    }
}