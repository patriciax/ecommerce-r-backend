import { Request, Response } from "express"

export class shipmentController {

    public getRates = async(req:Request, res:Response) => {

        try{

        }catch(err: any){
            console.log(err)
            res.status(500).json({ message: err.message })
        }

    }

}