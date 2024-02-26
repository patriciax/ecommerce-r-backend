import axios from "axios";
import { DolarPrice } from "../models/dolarPrice.schema";


export class DolarPriceController{

    public updateDolarPrice = async() => {

        const response = await axios.get('https://pydolarvenezuela-api.vercel.app/api/v1/dollar/')

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

        

    }

}