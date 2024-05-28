import mongoose from "mongoose";
import { User } from "../models/user.schema";
import { Role } from "../models/role.schema";

const usersList = [
    {
        name: 'Admin',
        email: 'admin@example.com',
        password: '41lz0DAqKVOn',
        emailVerifiedAt: Date.now(),
        role: "ADMIN"
    }
]

export class UserSeeder {
    async seed() {

        const users = await User.find({})
        
        const usersToInsert = usersList.filter(userList => !users.find(user => user.email === userList.email))

        for (const user of usersToInsert){
            const role = await Role.findOne({name: user.role})
            if(role){
                user.role = role._id.toString();
                await User.create(user)
            }
            
        }

        console.log("user seeded")
    
    
    }
}