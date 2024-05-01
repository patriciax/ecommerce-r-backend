import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
//import { initCloudinary } from './config/cloudinary';

import productRoutes from './routes/products.route'
import userRoutes from './routes/users.route'
import categoryRoutes from './routes/categories.route'
import sizeRoutes from './routes/sizes.route'
import colorRoutes from './routes/colors.route'
import giftCardsRoutes from './routes/giftCards.route'
import clientRoutes from './routes/clients.route'
import cartRoutes from './routes/carts.route'
import newsletterRoutes from './routes/newsletter.route'
import checkoutRoutes from './routes/checkout.route'
import bannerRoutes from './routes/banners.route'
import zoomRoutes from './routes/zoom.route'
import invoicesRoutes from './routes/invoices.route'
import dolarPriceRoutes from './routes/dolarPrice.route'
import countryRoute from './routes/country.route'
import favoriteRoute from './routes/favorite.route'
import pagoMovilRoute from './routes/pagomovil.route'
import zelleRoute from './routes/zelle.route'

import bodyParser from 'body-parser';
import cors from 'cors';
import { NewsletterJob } from './jobs/newsletter.job';
import { DolarPriceJob } from './jobs/dolarPrice.job';

const result = dotenv.config({path: `${__dirname}/config.env`})
const dbString = process.env.DATABASE || '';

mongoose.connect(dbString).then(() => {
    console.log('Connected to MongoDB')
})

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

//initCloudinary()

const app = express();
app.set('trust proxy', true)
app.use(bodyParser.json({limit: '35mb'}));
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000', 'https://ecommerce-dashboard.sytes.net', 'https://ecommerce.sytes.net'],
}));
app.use(express.json())
app.use(express.static('uploads'))

app.use("/api/v1/banners", bannerRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/categories", categoryRoutes)
app.use("/api/v1/sizes", sizeRoutes)
app.use("/api/v1/colors", colorRoutes)
app.use("/api/v1/gift-cards", giftCardsRoutes)
app.use("/api/v1/clients", clientRoutes)
app.use("/api/v1/carts", cartRoutes)
app.use("/api/v1/newsletter", newsletterRoutes)
app.use("/api/v1/checkout", checkoutRoutes)
app.use("/api/v1/zoom", zoomRoutes)
app.use("/api/v1/invoices", invoicesRoutes)
app.use("/api/v1/dolar-price", dolarPriceRoutes)
app.use("/api/v1/countries", countryRoute)
app.use("/api/v1/favorites", favoriteRoute)
app.use("/api/v1/pago-movil", pagoMovilRoute)
app.use("/api/v1/zelle", zelleRoute)

app.all('*', (req, res, next) => {
    return res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`
    })
})

app.listen(5000, () => {
    console.log('Server is running on port 5000')
})

const newsLetterJob = new NewsletterJob()
const dolaPriceJob = new DolarPriceJob()

newsLetterJob.sendNewsletter()
//dolaPriceJob.updateDolarPrice()

