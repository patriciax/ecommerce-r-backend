import { Request, Response } from "express"
import { Shippo } from "shippo";

export class ShipmentController {

    private shippoClient: any;

    setAPI(){
        this.shippoClient = new Shippo({
            apiKeyHeader: process.env.SHIPPO_API,
            shippoApiVersion: "2018-02-08",
        });
    }

    public getRates = async(req:Request, res:Response) => {
        
        try{
            this.setAPI()

            const addressFrom  = {
                "name": "Shawn Ippotle",
                "street1": "215 Clayton St.",
                "city": "San Francisco",
                "state": "CA",
                "zip": "94117",
                "country": "US"
            };
            
            const addressTo = {
                "name": req.body.name,
                "street1": req.body.street1,
                "city": req.body.city,
                "state": req.body.state,
                "zip": req.body.zip,
                "country": req.body.country
            };
            
            const parcel = {
                "length": "5",
                "width": "5",
                "height": "5",
                "distanceUnit": "cm",
                "weight": "2",
                "massUnit": "kg"
            };
   
            const response = await this.shippoClient.shipments.create({
                "addressFrom": addressFrom,
                "addressTo": addressTo,
                "parcels": [parcel],
                "carrierAccounts": [
                    process.env.CARRIER_ACCOUNT
                ],
            })

            return res.status(200).json({
                status: 'success',
                data: response.rates
            })

        }catch(err: any){
            return res.status(500).json({ message: err.message })
        }

    }

}