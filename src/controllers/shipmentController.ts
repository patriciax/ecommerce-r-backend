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

            // const addressTo = {
            //     "name": "Mr Hippo",
            //     "street1": "Broadway 1",
            //     "city": "New York",
            //     "state": "NY",
            //     "zip": "10007",
            //     "country": "US"
            // };
            
            const addressTo = {
                "name": req.body.name,
                "street1": req.body.street1,
                "city": req.body.city,
                "state": req.body.state,
                "zip": req.body.zip,
                "country": req.body.country
            };

            const parcel:any = []

            req.body.parcel.forEach((item:any) => {
                
                for(let i = 0; i < item.quantity; i++){
                    parcel.push({
                        "metadata":`${item.nameEnglish} - ${item.color.englishName} - ${item.size.englishName}`,
                        "length": `${item.length}`,
                        "width": `${item.width}`,
                        "height": `${item.height}`,
                        "distanceUnit": "cm",
                        "weight": `${item.weight}`,
                        "massUnit": "kg"
                    })
                }
                
            })

            // console.log({
            //     "addressFrom": addressFrom,
            //     "addressTo": addressTo,
            //     "parcels": parcel,
            //     "carrierAccounts": [
            //         process.env.CARRIER_ACCOUNT
            //     ],
            // })
   
            const response = await this.shippoClient.shipments.create({
                "addressFrom": addressFrom,
                "addressTo": addressTo,
                "parcels": parcel
            })

            return res.status(200).json({
                status: 'success',
                data: response.rates
            })

        }catch(err: any){
            return res.status(500).json({ message: err.message })
        }

    }

    public createShipment = async(rateId:any) => {

        try{
            this.setAPI()
            const response = await this.shippoClient.transactions.create({
                "rate": rateId,
                "label_file_type": "PDF",
                "async": false
            })

            return response

        }catch(err: any){
            console.log(err)
            return {
                status: 'error'
            }
        }

    }

}