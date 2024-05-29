import { SentMessageInfo, Transporter, createTransport } from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import {resolve} from "path"

export class EmailController {

    transporter:Transporter<SentMessageInfo> | null = null

    constructor(){

        this.transporter = createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '0'),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const handlebarOptions = {
            viewEngine: {
                extName: '.hbs',
                layoutsDir: resolve('./src/mail/templates'),
            },
            viewPath: resolve('./src/mail/templates/'),
        };

        this.transporter.use('compile', hbs(handlebarOptions));

    }

    sendEmail = async(template:string, receiver:string, subject:string, context:any) => {

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            template: template,
            to: receiver.toString(), // Convertir el tipo 'String' a 'string'
            subject: subject,
            context: context,
        };

        if(this.transporter){
            console.log("entre")
            const result = await this.transporter.sendMail(mailOptions);
            console.log(result)
        }

    }

}