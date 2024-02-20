import { AdminEmail } from "../models/adminEmail.schema";

const emailAdminList = [
    {
        email: 'rodriguezwillian95@gmail.com',
    }
]

export class AdminEmailSeeder {
    async seed() {

        await AdminEmail.deleteMany()
        await AdminEmail.insertMany(emailAdminList)

        console.log("admin email seeded")
    
    
    }
}