import axios from "axios"
import { PaypalController } from "./paymentMethods/PaypalController"

export class CheckoutController {

    paymentMethods = [
        'credits',
        'paypal-create-order',
        'paypal-approve-order',
        'stripe',
        'mercantil',
        'banesco'
    ]
    
    public paymentProcess = async (req: any, res: any) => {

        const paypalProcess = new PaypalController()

        if(req.body.paymentMethod === 'credits'){
            
        }

        else if(req.body.paymentMethod === 'paypal-create-order'){
            const order = await paypalProcess.createOrder([])
            return res.status(200).json({
                order
            })
        }

        else if(req.body.paymentMethod === 'paypal-approve-order'){
            const response = await paypalProcess.captureOrder(req.body.orderId)
            return res.status(200).json({
                response
            })
        }

        return res.status(200).json({
            status: 'success',
            message: 'Payment process'
        })

    }


}