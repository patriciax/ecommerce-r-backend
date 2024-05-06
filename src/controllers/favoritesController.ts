import { Request, Response } from 'express'
import { Product } from '../models/product.schema';
import { Favorite } from '../models/favorite.schema';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export class FavoriteController {

    public storeFavorite = async(req:Request, res:Response) : Promise<any> => {

        try{

            const product = await Product.findById(req.body.productId);
            if(!product) return res.status(404).json({ status: 'fail', message: 'PRODUCT_NOT_FOUND' })

            const favoriteFound = await Favorite.findOne({
                user: req.user._id,
                product: req.body.productId
            })

            if(favoriteFound){
                await Favorite.findByIdAndDelete(favoriteFound._id)
                return res.status(201).json({
                    status: 'success',
                    message: 'FAVORITE_REMOVED',
                })
            }

            const favorite = await Favorite.create({
                user: req.user._id,
                product: req.body.productId
            })

            return res.status(201).json({
                status: 'success',
                message: 'FAVORITE_ADDED_SUCCESSFULLY',
                data: favorite
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }

    }

    public deleteFavorite = async(req:Request, res:Response) : Promise<any> => {

        try{

            const favorite = await Favorite.findById(req.params.favoriteId);
            if(!favorite) return res.status(404).json({ status: 'fail', message: 'No favorite found with that ID' })

            await Favorite.findByIdAndDelete(req.params.favoriteId)

            return res.status(201).json({
                status: 'success',
                message: 'FAVORITE_REMOVED',
            })

        }
        catch(err: any){
            res.status(500).json({ message: err.message })
        }

    }

    public getFavorites = async(req:Request, res:Response) => {
        try{

            const favorites = await Favorite.find({user: req.user._id}).populate('product');

            if (!favorites) return res.status(404).json({ status: 'fail', message: 'No favorites found' });

            return res.status(200).json({
                status: 'success',
                data: favorites
            })

        }catch(err){
            return res.status(404).json({
                status: 'fail',
                message: 'No color found with that ID'
            })
        }
    }

}