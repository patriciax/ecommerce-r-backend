import axios from "axios";
import { Request, Response } from "express";
import * as Crypto from "../../utils/cryptoFeatures.js";
import { DolarPrice } from "../../models/dolarPrice.schema";
import { taxCalculations } from "../../utils/taxCalculation";
import { decimalNumberFormat } from "../../utils/numberFormat";
export class MercantilController {

    public async getOTPCode(req: Request, res: Response) {

        const headers = {
            'Content-Type': 'application/json',
            'X-IBM-Client-Id': process.env.MERCANTIL_HTTP_HEADER
        }

        try{
            let ip = ""
            if(req.ip){
                ip = req.ip?.split(':')?.pop() ?? ''
            }
            
            const mercantilData = {
                "merchant_identify": {
                  "integratorId": "1",
                  "merchantId": process.env.MERCANTIL_ID,
                  "terminalId": "1"
                },
                "client_identify": {
                  "ipaddress": ip,
                  "browser_agent": "Chrome 18.1.3",
                  "mobile": {
                    "manufacturer": "Samsung",
                    "model": "S9",
                    "os_version": "Oreo 9.1",
                    "location": {
                      "lat": 37.422476,
                      "lng": 122.08425
                    }
                  }
                },
                "transaction_authInfo": {
                  "trx_type": "solaut",
                  "payment_method": "tdd",
                  "card_number": req.body.cardNumber,
                  "customer_id": req.body.identification
                }
            }
            console.log(`mercantil ${process.env.MERCANTIL_API_URL}/payment/getauth`)
            const response = await axios.post(`${process.env.MERCANTIL_API_URL}/payment/getauth`, mercantilData, {headers})

            let label = ""
            let type = ""
            let fieldType = ""
            let length = ""
            
            if(response.data.authentication_info){

                label = Crypto.decryptAES256(response.data?.authentication_info?.twofactor_label, process.env.MERCANTIL_CYPHER_KEY ?? '')
                type = Crypto.decryptAES256(response.data?.authentication_info?.twofactor_type, process.env.MERCANTIL_CYPHER_KEY ?? '')
                fieldType = Crypto.decryptAES256(response.data?.authentication_info?.twofactor_field_type, process.env.MERCANTIL_CYPHER_KEY ?? '')
                length = Crypto.decryptAES256(response.data?.authentication_info?.twofactor_lenght, process.env.MERCANTIL_CYPHER_KEY ?? '')

            }

            if(response.data.authentication_info?.trx_status != "approved"){
                return res.status(400).json({
                    'status': 'fail'
                })
            }

            return res.status(200).json({
                'status': 'success',
                'label': label,
                'type': type,
                'fieldType': fieldType,
                'length': length
            })


        }catch(error:any){

            console.log(error?.response?.data ?? error)
            return res.status(400).json({
                'status': 'fail'
            })
        }

    }

    public makePayment = async(data:any, cart:any, ivaType:string) => {
        
        try{

            const headers = {
                'Content-Type': 'application/json',
                'X-IBM-Client-Id': process.env.MERCANTIL_HTTP_HEADER
            }

            const dolarPrice:any = await DolarPrice.findOne({}).sort({createdAt: -1})
            const total = cart.reduce((acc:number, item:any) => acc + (item.priceDiscount || item.price) * item.quantity, 0) * dolarPrice?.price ?? 1

            const totalWithTax = taxCalculations(total, ivaType)
            const formatedTotal = decimalNumberFormat(totalWithTax)

            const mercantilData = {
                "merchant_identify": {
                    "integratorId": "1",
                    "merchantId": process.env.MERCANTIL_ID,
                    "terminalId": "1"
                },
                "client_identify": {
                    "ipaddress": data.ip,
                    "browser_agent": "Chrome 18.1.3", 
                    "mobile": {
                        "manufacturer": "Samsung"
                    }
                },
                "transaction": {
                    "trx_type": "compra",
                    "payment_method": "tdd",
                    "card_number": data.cardNumber,
                    "customer_id": data.cardHolderId,
                    "invoice_number": data.transactionOrder,
                    "account_type":data.accountType,
                    "twofactor_auth": Crypto.encryptAES256(data.twofactorAuth, process.env.MERCANTIL_CYPHER_KEY ?? ''),
                    "expiration_date": data.expirationDate.split('/').reverse().join('/'),
                    "cvv": Crypto.encryptAES256(data.cvc, process.env.MERCANTIL_CYPHER_KEY ?? ''),
                    "currency": "ves",
                    "amount": formatedTotal
                }
            }

            const response = await axios.post(`${process.env.MERCANTIL_API_URL}/payment/pay`, mercantilData,
            {
                headers
            })

            return response.data

        }catch(error:any){
            console.log(error.response.data)
            return error
        }

    }

}