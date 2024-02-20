import { Request, Response } from "express";
import Joi from "@hapi/joi";

const schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(8).max(30).required(),
    phone: Joi.string().min(10).max(10).required(),
});

export const registerValidator = async (req:Request, res:Response, next:Function) => {

    try {
        await schema.validateAsync(req.body, {abortEarly: false});
        next();
    }
    catch (err) { 
        return res.status(400).json({ error: err})
    }

}