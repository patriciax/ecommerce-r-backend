import { Request, Response } from 'express'
import { Country } from '../models/country.schema'

export class CountryController {

    public countries = async(req:Request, res:Response) : Promise<any> => {
            
        try{
            
            const countries = await Country.find()

            return res.status(200).json({
                status: 'success',
                data: {
                    countries
                }
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }
    }

}