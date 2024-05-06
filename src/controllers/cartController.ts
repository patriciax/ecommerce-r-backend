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
        const errors:any = []

        if(!req.body.productId) errors.push('PRODUCT_ID_IS_REQUIRED')
        if(!req.body.quantity) errors.push('QUANTITY_IS_REQUIRED')


        const product = await Product.findById(req.body.productId)
        if(!product) errors.push('PRODUCT_NOT_FOUND')

        const stock = product?.productVariations.find((item) => item.color[0]._id == req.body.color._id && item.size[0]._id == req.body.size._id)?.stock ?? 0

        if(product && req.body.quantity > stock) errors.push('QUANTITY_EXCEEDS_STOCK')

        return errors
    }

    public addProductToCart = async(req:Request, res:Response) => {    

        try{

            const results = await this.validateInput(req)
            if(results.length > 0) 
                return res.status(422).json({ status: 'fail', message: results })
            
            const carts = await Cart.find({user: req.user._id})

            if(carts.length > 0){

                const product = carts.find((product:any) => product.product == req.body.productId && product.size == req.body.size._id && product.color == req.body.color._id)

                if(product){

                    const cartModel = await Cart.findOne({user: req.user._id, product: product.product, size: product.size, color: product.color})
                    const productModel = await Product.findById(product.product)
                    const productStock = productModel?.productVariations.find((item) => item.color[0]._id == req.body.color._id && item.size[0]._id == req.body.size._id)?.stock ?? 0

                    if(productStock < cartModel?.quantity + req.body.quantity) 
                        return res.status(422).json({ status: 'fail', message: 'QUANTITY_EXCEEDS_STOCK' })

                    if(cartModel){
                        
                        cartModel.quantity = cartModel.quantity + req.body.quantity
                        await  cartModel.save()

                        return res.status(200).json({
                            status: 'success',
                            data: {
                                message: 'PRODUCT_ADDED_TO_CART'
                            }
                        })
                    }
                }
            }
            
            await Cart.create({
                user: req.user._id,
                product: req.body.productId,
                size: req.body.size,
                color: req.body.color,
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

            const cart = await Cart.findOne({user: req.user._id, product: req.body.productId, size: req.body.size, color: req.body.color})

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

            const cart = await Cart.findOne({user: req.user._id, product: req.params.id})

            if(!cart){
                return res.status(404).json({
                    status: 'fail',
                    data: {
                        message: 'PRODUCT_NOT_FOUND_IN_CART'
                    }
                })
            }

            await Cart.findByIdAndDelete(cart._id)

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
                const variation = productDB.productVariations.find((variation:any) => variation.color[0]._id == item.color && variation.size[0]._id == item.size)

                if(product){
                    
                    quantity = product.quantity + item.quantity
                    variation?.stock ? quantity > variation.stock ? quantity = variation.stock : quantity : 0

                }else{
                    quantity = item.quantity
                    variation?.stock ? quantity > variation.stock ? quantity = variation.stock : quantity : 0
                }
                
                cartItems.push({
                    user: req.user._id,
                    product: item.productId,
                    size: item.size,
                    color: item.color,
                    quantity: quantity
                })
            }

            if(products.length === 0){
                await Cart.insertMany(cartItems)
            }

            else{

                for(const item of products){
                    
                    const product: any = cartItems.find((cartProduct: any) => cartProduct.product == item?.product && cartProduct.size._id == item?.size && cartProduct.color._id == item?.color)
                    
                    if(product){

                        const cartProductToUpdate = await Cart.findOne({size: product.size._id, color: product.color._id, product: product.product})
                        
                        if(!cartProductToUpdate) continue

                        cartProductToUpdate.quantity = cartProductToUpdate.quantity + item.quantity
                        cartProductToUpdate.save()
                        
                    }   
                    
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

            const products:any = await Product.find({_id: {$in: req.body.cartProducts.map((product:any) => product.productId)}}).populate('productVariations.size').populate('productVariations.color').lean()

            const productsWithQuantity:any = []

            req.body.cartProducts.forEach((cartProduct:any) => {

                const variationToAdd:any = products.find((product:any) => product._id == cartProduct.productId)?.productVariations.find((variation:any) => variation.color[0]._id == cartProduct.color?._id && variation.size[0]._id == cartProduct.size?._id)

                productsWithQuantity.push({
                    ...products.find((product:any) => product._id == cartProduct.productId),
                    size: variationToAdd?.size[0],
                    color: variationToAdd?.color[0],
                    stock: variationToAdd?.stock,
                    quantity: variationToAdd?.stock ? cartProduct.quantity >  variationToAdd?.stock ? variationToAdd?.stock : cartProduct.quantity : 0
                })
            })

            return res.status(200).json({
                status: 'success',
                data: {
                    "cart": productsWithQuantity
                }
            })
        }catch(err){

            console.log(err)

            return res.status(500).json({
                status: 'fail',
                message: 'SOMETHING_WENT_WRONG'
            })
        }

    }

    public productInfo = async(req:Request, res:Response) => {

        try{

            const products = await Cart.find({user: req.user._id}).populate('product').populate('size').populate('color').lean()

            const carts = products.map((product:any) => {

                const variationToAdd:any = product.product.productVariations.find((variation:any) => variation.color[0].toString() == product.color?._id.toString() && variation.size[0].toString() == product.size?._id.toString())

                if(product.product) 
                    return {
                        ...product.product,
                        size: product.size,
                        color: product.color,
                        stock: variationToAdd?.stock ?? 0,
                        quantity: product.quantity > variationToAdd?.stock ? variationToAdd?.stock : product.quantity
                    }

            })

            return res.status(200).json({
                status: 'success',
                data: {
                    "cart": carts
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