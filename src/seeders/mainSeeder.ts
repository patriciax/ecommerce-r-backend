import mongoose from "mongoose"
import { RoleSeeder } from "./roleSeeders"
import {UserSeeder} from "./userSeeders"
import dotenv from 'dotenv';

const result = dotenv.config({path: `${__dirname}/../config.env`})

mongoose.connect(process.env.DATABASE || '').then( async () => {
    console.log('Connected to database')

    const roleSeeder = new RoleSeeder()
    await roleSeeder.seed()

    const userSeeder = new UserSeeder()
    await userSeeder.seed()

    console.log("finish seeding")
    process.exit()
    
})