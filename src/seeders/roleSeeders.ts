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
        name: 'EMPLOYEE',
        permissions: []
    },
    {
        name: 'CUSTOMER',
        permissions: []
    }
]

const permissions = [
    
    //ADMIN
    
    {role: "ADMIN", permission: "PRODUCT-CREATE"},
    {role: "ADMIN", permission: "PRODUCT-LIST"},
    {role: "ADMIN", permission: "PRODUCT-UPDATE"},
    {role: "ADMIN", permission: "PRODUCT-DELETE"},
    
    {role: "ADMIN", permission: "SIZE-CREATE"},
    {role: "ADMIN", permission: "SIZE-LIST"},
    {role: "ADMIN", permission: "SIZE-UPDATE"},
    {role: "ADMIN", permission: "SIZE-DELETE"},

    {role: "ADMIN", permission: "CATEGORY-CREATE"},
    {role: "ADMIN", permission: "CATEGORY-LIST"},
    {role: "ADMIN", permission: "CATEGORY-UPDATE"},
    {role: "ADMIN", permission: "CATEGORY-DELETE"},

    {role: "ADMIN", permission: "COLOR-CREATE"},
    {role: "ADMIN", permission: "COLOR-LIST"},
    {role: "ADMIN", permission: "COLOR-UPDATE"},
    {role: "ADMIN", permission: "COLOR-DELETE"},

    {role: "ADMIN", permission: "EMPLOYEE-CREATE"},
    {role: "ADMIN", permission: "EMPLOYEE-LIST"},
    {role: "ADMIN", permission: "EMPLOYEE-UPDATE"},
    {role: "ADMIN", permission: "EMPLOYEE-DELETE"},

    {role: "ADMIN", permission: "GIFT-CARD-CREATE"},
    {role: "ADMIN", permission: "GIFT-CARD-LIST"},
    {role: "ADMIN", permission: "GIFT-CARD-UPDATE"},
    {role: "ADMIN", permission: "GIFT-CARD-DELETE"},

    //EMPLOYEE

    {role: "EMPLOYEE", permission: "PRODUCT-CREATE"},
    {role: "EMPLOYEE", permission: "PRODUCT-LIST"},
    {role: "EMPLOYEE", permission: "PRODUCT-UPDATE"},
    {role: "EMPLOYEE", permission: "PRODUCT-DELETE"},
    
    {role: "EMPLOYEE", permission: "SIZE-CREATE"},
    {role: "EMPLOYEE", permission: "SIZE-LIST"},
    {role: "EMPLOYEE", permission: "SIZE-UPDATE"},
    {role: "EMPLOYEE", permission: "SIZE-DELETE"},

    {role: "EMPLOYEE", permission: "CATEGORY-CREATE"},
    {role: "EMPLOYEE", permission: "CATEGORY-LIST"},
    {role: "EMPLOYEE", permission: "CATEGORY-UPDATE"},
    {role: "EMPLOYEE", permission: "CATEGORY-DELETE"},

    {role: "EMPLOYEE", permission: "COLOR-CREATE"},
    {role: "EMPLOYEE", permission: "COLOR-LIST"},
    {role: "EMPLOYEE", permission: "COLOR-UPDATE"},
    {role: "EMPLOYEE", permission: "COLOR-DELETE"},
   

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

