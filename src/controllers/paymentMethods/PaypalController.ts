import axios from "axios"

export class PaypalController {

    private baseUrl = () => process.env.PAYPAL_ENVIRONMENT === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

    private generateAccessToken = async () => {     

        try{

            const res = await axios(
            {
                method: 'post',
                url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
                data: 'grant_type=client_credentials', // => this is mandatory x-www-form-urlencoded. DO NOT USE json format for this
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',// => needed to handle data parameter
                    'Accept-Language': 'en_US',
                },
                auth: {
                    username: process.env.PAYPAL_CLIENT_ID || '',
                    password: process.env.PAYPAL_CLIENT_SECRET || ''
                },
        
            });

            return res.data?.access_token;

        }catch(error){

        }
           
    }

    public createOrder = async (cart:any) => {
        
      const total = cart.reduce((acc:number, item:any) => acc + (item.priceDiscount || item.price) * item.quantity, 0)
        
        const accessToken = await this.generateAccessToken();
        const url = `${this.baseUrl()}/v2/checkout/orders`;
        const payload = {
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: total,
              },
            },
          ],
        };

        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        })
        
        /*const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
            // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
            // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
          },
          method: "POST",
          body: JSON.stringify(payload),
        });*/
        
        return response.data
    };

    public createOrderCard = async (cardPrice:any) => {
        
      const total = cardPrice
        
        const accessToken = await this.generateAccessToken();
        const url = `${this.baseUrl()}/v2/checkout/orders`;
        const payload = {
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: total,
              },
            },
          ],
        };

        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        })
        
        return response.data
    };

    public captureOrder = async (orderID:String) => {
        try{

            const accessToken = await this.generateAccessToken();
            const url = `${this.baseUrl()}/v2/checkout/orders/${orderID}/capture`;

            const response = await axios.post(url, null, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
            })
            
            /*const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
                // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
                // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
                // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
                // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
            },
            });*/
            
            return response.data

        }catch(error){

            console.log(error)

        }
      };

}