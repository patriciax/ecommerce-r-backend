import { NextFunction, Request, Response } from "express";
import { Cart } from "../models/cart.schema";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const sanitizeCart = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const cartToDelete:any[] = []
        const cart = await Cart.find({ user: req.user._id }).populate('product').lean();

        cart.forEach((product: any) => {

            if (!product.product)
                cartToDelete.push(product._id)

        })

        await Cart.deleteMany({_id: {$in: cartToDelete}})

        let carts = cart.map((product: any) => {

            if (product.product)
                return {
                    ...product,
                    quantity: product.quantity > product.product.stock ? product.product.stock : product.quantity
                }

        })

        for(let cart of carts){
            if(cart)
                await Cart.findByIdAndUpdate(cart._id, {quantity: cart.quantity})
        }

    } catch (error: any) {
        console.log(error)
        return res.status(500).json({
            status: 'fail',
            message: 'SOMETHING_WENT_WRONG'
        });
    }

    next();
    

}