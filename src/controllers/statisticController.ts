import { Request, Response } from 'express'
import { Payment } from '../models/payments.schema'
import { DolarPrice } from '../models/dolarPrice.schema'
import { User } from '../models/user.schema'
import { Role } from '../models/role.schema'
import { Invoice } from '../models/invoice.schema'

export class StatisticController {

    private bolivars = async () => {
        const bolivarsRevenuesTotal:any = await Payment.aggregate(
            [
                {
                    $match: { 
                        type: { 
                            $in : ["pagoMovil", "banesco"]
                        }
                    }
                },
                {
                    $group: { 
                        _id: null, 
                        totalQuantity: { $sum: '$total' }
                    }
                }
            ]

        )

        const bolivarsRevenuesTaxAmount:any = await Payment.aggregate(
            [
                {
                    $match: { 
                        type: { 
                            $in : ["pagoMovil", "banesco"]
                        } 
                    }
                },
                {
                    $group: { 
                        _id: null, 
                        totalQuantity: { $sum: '$taxAmount' } 
                    }
                }
            ]

        )

        return bolivarsRevenuesTotal[0]?.totalQuantity + bolivarsRevenuesTaxAmount[0]?.totalQuantity 
    }

    private dolars = async () => {
        const dolarsRevenuesTotal:any = await Payment.aggregate(
            [
                {
                    $match: { 
                        type: { 
                            $in : ["paypal", "zelle", "giftCard"]
                        } 
                    }
                },
                {
                    $group: { 
                        _id: null, 
                        totalQuantity: { $sum: '$total' }
                    }
                }
            ]

        )

        const dolarsRevenuesTaxAmount:any = await Payment.aggregate(
            [
                {
                    $match: { 
                        type: { 
                            $in : ["paypal", "zelle", "giftCard"]
                        } 
                    }
                },
                {
                    $group: { 
                        _id: null, 
                        totalQuantity: { $sum: '$taxAmount' } 
                    }
                }
            ]

        )

        const dolarsRevenuesCarrier:any = await Payment.aggregate(
            [
                {
                    $match: { 
                        type: { 
                            $in : ["paypal", "zelle", "giftCard"]
                        } 
                    }
                },
                {
                    $group: { 
                        _id: null, 
                        totalQuantity: { $sum: '$carrierRateAmount' } 
                    }
                }
            ]

        )

        return dolarsRevenuesTotal[0]?.totalQuantity + dolarsRevenuesTaxAmount[0]?.totalQuantity + dolarsRevenuesCarrier[0]?.totalQuantity
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

        return dolarsRevenue.reduce((acc: number, payment: any) => acc + payment.total + payment.taxAmount + payment.createRate.amount, 0)

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

    public todayRevenue = async() => {



    }

    public statistic = async (req:Request, res:Response) => {

        const dolarPrice = await DolarPrice.findOne()
        const totalBolivars = await this.bolivars()
        const totalBolivarsDolarPrice = totalBolivars / (dolarPrice?.price ?? 0)

        const totalDolars = await this.dolars()
        const clients = await this.getClients()
        const latestSales = await this.latestSales()
        const todayBolivars = await this.todayBolivars()
        const todayDolars = await this.todayDolars()
        
        //console.log(totalBolivarsDolarPrice + totalDolars)
        //console.log(clients)
        //console.log(latestSales)
        console.log(todayBolivars)
        //await Payment.find({"type" : { $in : ["pagoMovil", "banesco"]}}).

        res.status(200).json({

        })

    }



}