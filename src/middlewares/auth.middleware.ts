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
        const user = await User.findById(userInfo._id);
        req.body.user = user;

    } catch (error: any) {
        return res.status(401).json({
            status: 'fail',
            message: 'You are not authorized to access this resource'
        });
    }

    next();
    

}