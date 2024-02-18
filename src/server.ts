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

import bodyParser from 'body-parser';
import cors from 'cors';

const result = dotenv.config({path: `${__dirname}/config.env`})
const dbString = process.env.DATABASE || '';

mongoose.connect(dbString).then(() => {
    console.log('Connected to MongoDB')
})

//initCloudinary()

const app = express();
app.use(bodyParser.json({limit: '35mb'}));
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5000', 'http://ecommerce-dashboard.sytes.net'],
}));
app.use(express.json())
app.use(express.static('uploads'))

app.use("/api/v1/products", productRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/categories", categoryRoutes)
app.use("/api/v1/sizes", sizeRoutes)
app.use("/api/v1/colors", colorRoutes)
app.use("/api/v1/gift-cards", giftCardsRoutes)

app.all('*', (req, res, next) => {
    return res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`
    })
})

app.listen(5000, () => {
    console.log('Server is running on port 5000')
})
