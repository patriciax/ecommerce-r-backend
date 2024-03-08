import { Request, Response } from "express";
import { Cart } from "../models/cart.schema";
import { Product } from "../models/product.schema";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export class CartController {

    private validateInput = async(req:Request) => {
        const errors = []

        if(!req.body.productId) errors.push('PRODUCT_ID_IS_REQUIRED')
        if(!req.body.quantity) errors.push('QUANTITY_IS_REQUIRED')


        const product = await Product.findById(req.body.productId)
        if(!product) errors.push('PRODUCT_NOT_FOUND')

        if(product && req.body.quantity > product.stock) errors.push('QUANTITY_EXCEEDS_STOCK')

        return errors
    }

    public addProductToCart = async(req:Request, res:Response) => {    

        try{

            const results = await this.validateInput(req)
            if(results.length > 0) 
                return res.status(422).json({ status: 'fail', message: results })
            
            Cart.create({
                user: req.user._id,
                product: req.body.productId,
                quantity: req.body.quantity,
            })

            return res.status(200).json({
                status: 'success',
                data: {
                    message: 'PRODUCT_ADDED_TO_CART'
                }
            })
        }catch(err){
            return res.status(500).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }
    }

    public updateProductToCart = async(req:Request, res:Response) => {

        try{

            const results = await this.validateInput(req)
            if(results.length > 0) 
                return res.status(422).json({ status: 'fail', message: results })

            const cart = await Cart.findOne({user: req.user._id, product: req.body.productId})

            if(!cart) 
                return res.status(404).json({
                    status: 'fail',
                    message: 'PRODUCT_NOT_FOUND_IN_CART'
                })

            cart.quantity = req.body.quantity
            cart.save()

            return res.status(200).json({
                status: 'success',
                data: {
                    message: 'PRODUCT_UPDATED_IN_CART'
                }
            })
        }catch(err){
            return res.status(500).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }
    }

    public deleteProductFromCart = async(req:Request, res:Response) => {
        try{

            const cart = await Cart.findByIdAndDelete(req.params.id)

            if(!cart){
                return res.status(404).json({
                    status: 'fail',
                    data: {
                        message: 'PRODUCT_NOT_FOUND_IN_CART'
                    }
                })
            }

            return res.status(200).json({
                status: 'success',
                data: {
                    message: 'PRODUCT_DELETED_FROM_CART'
                }
            })
        }catch(err){
            return res.status(500).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }
    }

    public massAssignment = async(req:Request, res:Response) => {

        try{

            const products = await Cart.find({user: req.user._id}).lean()

            const cartItems = []

            for(const item of req.body.cartItems){
                const product = products.find((product:any) => product.product === item.productId)
                let productDB = null
                try{
                    productDB = await Product.findById(item.productId)
                }catch(error){
                    continue
                }
                if(productDB === null) continue

                let quantity = 0

                if(product){

                    quantity = product.quantity + item.quantity
                    if(quantity > productDB.stock) quantity = productDB.stock

                }else{
                    quantity = item.quantity
                    if(quantity > productDB.stock) quantity = productDB.stock
                }
                

                cartItems.push({
                    user: req.user._id,
                    product: item.productId,
                    quantity: quantity
                })
            }

            if(products.length === 0){
                await Cart.insertMany(cartItems)
            }

            else{

                for(const item of products){
                    const product = cartItems.find((product:any) => product.product == item?.product)
                    if(!product) continue

                    await Cart.findByIdAndUpdate(item._id, {quantity: product.quantity})
                    
                }

            }

            return res.status(200).json({
                status: 'success',
                data: {
                    message: 'PRODUCT_ADDED_CART'
                }
            })
        }catch(err){
            return res.status(500).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }

    }

    public productInfoGuest = async(req:Request, res:Response) => {

        try{

            const products = await Product.find({_id: {$in: req.body.cartProducts.map((product:any) => product.productId)}}).lean()

            const produtsWithQuantity = products.map((product:any) => {
                const cartProduct = req.body.cartProducts.find((cartProduct:any) => cartProduct.productId === product._id)
                return {
                    ...product,
                    quantity: cartProduct.quantity > product.stock ? product.stock : cartProduct.quantity
                }
            })

            return res.status(200).json({
                status: 'success',
                data: {
                    "cart": produtsWithQuantity
                }
            })
        }catch(err){
            return res.status(500).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }

    }

    public productInfo = async(req:Request, res:Response) => {

        try{

            const products = await Cart.find({user: req.user._id}).populate('product').lean()

            const carts = products.map((product:any) => {

                if(product.product) 
                    return {
                        ...product.product,
                        quantity: product.quantity > product.product.stock ? product.product.stock : product.quantity
                    }

            })

            return res.status(200).json({
                status: 'success',
                data: {
                    "cart": products
                }
            })
        }catch(err){
            return res.status(500).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }

    }

}