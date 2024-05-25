import { Request, Response } from "express"
import { EmailController } from "./emailController"

export class emailTestingController {

    private email = ""
    constructor() {
        this.email = "rodriguezwillian95@gmail.com"
    }

    public sendCreditCardBalance = async(req: Request, res: Response) => {

        const emailController = new EmailController()

        emailController.sendEmail("creditCardBalance", this.email, "Balance de GiftCard ERoca", {
            "cardNumber": "5793489526063202",
            "cardPin": "4102",
            "credits": "145.24"
        })

        return res.status(200).json({})

    }

    public sendEmailPasswordReset = async(req: Request, res: Response) => {

        const emailController = new EmailController()

        emailController.sendEmail("emailPasswordReset", this.email, "Password reset", {
            name: "Patricia Alvarez",
            emailOtp: "123456"
        })

        return res.status(200).json({})

    }

    public sendEmailVerify = async(req: Request, res: Response) => {

        const emailController = new EmailController()

        emailController.sendEmail("emailVerify", this.email, "Email verification", {
            "name": "Patricia",
            "emailOtp": "123456"
        })

        return res.status(200).json({})

    }

    public sendGiftCard = async(req: Request, res: Response) => {

        const emailController = new EmailController()

        emailController.sendEmail("giftCard", this.email, "Gift card recibida", {
            cardNumber: "5793489526063202",
            cardPin: "4102",
            message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
        })

        return res.status(200).json({})

    }

    public sendNewsletterHandlebars = async(req: Request, res: Response) => {

        const emailController = new EmailController()

        emailController.sendEmail("newsletter", this.email, "Algún titulo de newsletter", {
            title: "Algún titulo de newsletter",
            name: `Patricia Alvarez`,
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
        })

        return res.status(200).json({})

    }

    public sendShipTracking = async(req: Request, res: Response) => {

        const emailController = new EmailController()

        emailController.sendEmail("shipTracking", this.email, "Tracking de envío", {
            "invoiceNumber": "15664466757657",
            "tracking": "123456789102231232"
        })

        return res.status(200).json({})

    }

    public sendRejectedPayment = async(req: Request, res: Response) => {

        const emailController = new EmailController()

        emailController.sendEmail("rejectedPayment", this.email, "Pago rechazado", {
            "reference": "123456789102231232"
        })

        return res.status(200).json({})

    }

    public sendAdminNewRegister = async(req: Request, res: Response) => {

        const emailController = new EmailController()

        emailController.sendEmail("adminNewRegister", this.email, "Nuevo cliente registrado", {
            name: `Patricia Alvarez`,
            email: this.email,
            phone: "584121081638"
        });

        return res.status(200).json({})

    }

    public sendInvoice = async(req: Request, res: Response) => {

        const emailController = new EmailController()

        const carts = [
            {

                productModel: "Franela 1",
                colorModel: "Azul",
                sizeModel: "L",
                quantity:2
            },
            {

                productModel: "Franela 2",
                colorModel: "Amarillo",
                sizeModel: "M",
                quantity:4
            },
            {

                productModel: "Franela 3",
                colorModel: "Verde",
                sizeModel: "S",
                quantity:1
            },
            {

                productModel: "Franela 4",
                colorModel: "Rojo",
                sizeModel: "XL",
                quantity:1
            },
            {

                productModel: "Franela 5",
                colorModel: "Blanco",
                sizeModel: "XXL",
                quantity:3
            }
        ]


        emailController.sendEmail("invoice", this.email, "Factura ERoca", {
            "invoiceNumber": "123456789102231232",
            "user": "Patricia Alvarez",
            "carts": carts,
            "trackingNumber": "123456789102231232"
        })

        return res.status(200).json({})

    }




    

}