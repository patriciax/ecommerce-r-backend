import mongoose from "mongoose"
import { RoleSeeder } from "./roleSeeders"
import {UserSeeder} from "./userSeeders"
import dotenv from 'dotenv';
import { AdminEmailSeeder } from "./adminEmailSeeders";
import { CountrySeeder } from "./countriesSeeder";

const result = dotenv.config({path: `${__dirname}/../config.env`})

mongoose.connect(process.env.DATABASE || '').then( async () => {
    console.log('Connected to database')

    const roleSeeder = new RoleSeeder()
    await roleSeeder.seed()

    const userSeeder = new UserSeeder()
    await userSeeder.seed()

    const adminEmailSeeder = new AdminEmailSeeder()
    await adminEmailSeeder.seed()

    const countrySeeder = new CountrySeeder()
    await countrySeeder.seed()

    console.log("finish seeding")
    process.exit()
    
})