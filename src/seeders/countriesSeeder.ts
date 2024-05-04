import mongoose from "mongoose";
import { User } from "../models/user.schema";
import { Role } from "../models/role.schema";
import { Country } from "../models/country.schema";

const countryList = [
    {
        name: 'United States',
        value: 'US',
        states: ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],
        statesValues: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
    },
]

export class CountrySeeder {
    async seed() {

        const countries = await Country.find({})
        
        const countriesToInsert = countryList.filter(countryList => !countries.find(country => country.name === countryList.name))

        await Country.insertMany(countriesToInsert)

        console.log("Country seeded")
    
    
    }
}