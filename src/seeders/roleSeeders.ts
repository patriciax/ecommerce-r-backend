import mongoose from "mongoose"
import { Role } from "../models/role.schema"

interface RoleInterface {
    name: String,
    permissions: []
}

const roles: RoleInterface[] = [
    {
        name: 'ADMIN',
        permissions: []
    },
    {
        name: 'CUSTOMER',
        permissions: []
    }
]

const permissions = [
    {role: "ADMIN", permission: "PRODUCT-CREATE"},
    {role: "ADMIN", permission: "PRODUCT-LIST"},
    {role: "ADMIN", permission: "PRODUCT-UPDATE"},
    {role: "ADMIN", permission: "PRODUCT-DELETE"},
    {role: "CUSTOMER", permission: "PRODUCT-LIST"},
]

export class RoleSeeder {
    async seed() {

        try{
    
            const roleDocs:RoleInterface[] = await Role.find()
    
            if(roleDocs.length == 0){
                await Role.insertMany(roles)
            }else{
                const pendingRoles = roles.find(role => roleDocs.find(roleDoc => roleDoc.name === role.name) === undefined)
                if(pendingRoles){
                    await Role.insertMany(pendingRoles)
                }            
            }
    
            const roleDocs2 = await Role.find()
            roleDocs2.forEach(async(roleDoc) => {
    
                const actualRolePermissions = roleDoc.permissions
    
                const permissionsToInsert = permissions.filter(permission => permission.role === roleDoc.name).filter(permission => actualRolePermissions.find(actualRolePermission => actualRolePermission === permission.permission) === undefined)
    
                roleDoc.permissions = [...actualRolePermissions, ...permissionsToInsert.map(permission => permission.permission)]
                
                await Role.findByIdAndUpdate(roleDoc._id, roleDoc)
    
            })

            console.log("role seeded")
    
        }catch(err){
            console.log(err)
        }
    
    }
}

