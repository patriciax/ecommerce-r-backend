import axios from "axios";
import { DolarPrice } from "../models/dolarPrice.schema";
import { Request, Response } from "express";


export class DolarPriceController{

    public updateDolarPrice = async() => {

        const response = await axios.get('https://pydolarvenezuela-api.vercel.app/api/v1/dollar')

        try{

            if(response.data){
                const price = response.data?.monitors?.bcv?.price
    
                const dolarPrice = await DolarPrice.findOne();
    
                if(!dolarPrice){
                    await DolarPrice.create({price: price})
                    return
                }
    
                dolarPrice.price = price
                dolarPrice.updatedAt = new Date()
                dolarPrice.save()
                
            }       
    

        }catch(err){
            console.log(err)
        }
    }

    public getDolarPrice = async(req: Request, res: Response) => {
        const dolarPrice = await DolarPrice.findOne();
        return res.status(200).json({
            price: dolarPrice?.price
        })
    }

}