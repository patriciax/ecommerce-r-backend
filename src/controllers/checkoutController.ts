export class CheckoutController {

    paymentMethods = [
        'credits',
        'paypal',
        'stripe',
        'mercantil',
        'banesco'
    ]
    
    public paymentProcess = async (req: any, res: any) => {

        if(req.body.paymentMethod === 'credits'){
            
        }

        else if(req.body.paymentMethod === 'paypal'){
            
        }

        

    }

    private paypalProcess = async () => {

        

    }


}