import { Request, Response } from 'express'
import { Payment } from '../models/payments.schema'
import { DolarPrice } from '../models/dolarPrice.schema'
import { User } from '../models/user.schema'
import { Role } from '../models/role.schema'
import { Invoice } from '../models/invoice.schema'
import { AllTimePayment } from '../models/allTimePayments'
import { AllTimePurchase } from '../models/allTimePurchases.schema'

export class StatisticController {

    private totalPayments = async () => {
        
        const allPayments = await AllTimePayment.findOne({})
        return allPayments?.amount ?? 0

    }

    private todayBolivars = async () => {

        let startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        let endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const bolivarsRevenues:any = await Payment.find(
            {
                type: { 
                    $in : ["pagoMovil", "banesco"]
                },
                created: {
                    $gte: startOfDay, 
                    $lt: endOfDay
                }
            }
        )
        
        return bolivarsRevenues.reduce((acc: number, payment: any) => acc + payment.total + payment.taxAmount, 0)
    }

    private todayDolars = async () => {

        let startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        let endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const dolarsRevenue:any = await Payment.find(
            {
                type: { 
                    $in : ["paypal", "zelle", "giftCard"]
                },
                
                created: {
                    $gte: startOfDay, 
                    $lt: endOfDay
                }
                
            
            }
        )

        return dolarsRevenue.reduce((acc: number, payment: any) => acc + payment.total + payment.taxAmount + (payment.createRate ? payment?.createRate?.amount * 1 : 0), 0)

    }

    public getClients = async () => {

        const clientRole = await Role.findOne({name: "CUSTOMERS"})
        const clients = await User.find({role: clientRole?._id} )
        return clients.length
    }

    public latestSales = async () => {

        const latestSales = await Invoice.find()
            .sort("createdAt")
            .limit(10)
            .populate({
                path: 'payment',
                match: { status: 'approved' }
            })
            .populate("invoiceProduct")

        return latestSales

    }

    public mostPurchasedProducts = async () => {

        const products = await AllTimePurchase.find().sort({amount: -1}).limit(10).populate("product").populate("size").populate("color")
        return products
    }

    public lessPurchasedProducts = async () => {

        const products = await AllTimePurchase.find().sort("amount").limit(10).populate("product").populate("size").populate("color")
        return products
    }

    public statistic = async (req:Request, res:Response) => {

        const dolarPrice = await DolarPrice.findOne({})

        const totalPaymentsAmount = await this.totalPayments()        
        const clients = await this.getClients()
        const latestSales = await this.latestSales()
        const todayBolivars = await this.todayBolivars()
        const todayDolars = await this.todayDolars()
        const mostPurchasedProducts = await this.mostPurchasedProducts()
        const lessPurchasedProducts = await this.lessPurchasedProducts()
        const bolivarDolar = todayBolivars / (dolarPrice?.price ?? 1)

        const todayPurchase = bolivarDolar + todayDolars

        res.status(200).json({
            totalPayment: totalPaymentsAmount,
            clients,
            latestSales,
            todayPurchase,
            mostPurchasedProducts,
            lessPurchasedProducts
        })

    }



}