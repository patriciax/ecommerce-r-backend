import axios from "axios"

export class BanescoController {

    public makePayment = async(data:any, cart:any) => {
        
        try{

            const total = cart.reduce((acc:number, item:any) => acc + (item.priceDiscount || item.price) * item.quantity, 0)

            const response = await axios.post(`${process.env.BANESCO_API_URL}/payment`, {
                "KeyId": process.env.BANESCO_PRIVATE_KEY,
                "PublicKeyId": process.env.BANESCO_PUBLIC_KEY,
                "Amount": `${total}`,
                "Description": data.description,
                "CardHolder": data.cardHolder,
                "CardHolderId": data.cardHolderId,
                "CardNumber": data.cardNumber,
                "CVC": data.cvc,
                "ExpirationDate": data.expirationDate,
                "StatusId": 2,
                "IP": data.ip
            },
            {
                headers: {'content-type': 'application/x-www-form-urlencoded'}
            })

            
            return response.data

        }catch(error){

            return error
        }

    }

}