// import adminModel, { IadminDocument } from "../models/adminModel";
// import userModel, { IuserDocument } from "../models/userModel";
// //writes queries based on the database interaction

import { FilterQuery } from "mongoose";
import userModel, { IuserDocument } from "../models/userModel";
import { BaseRepository } from "./baseRepo";



// export class userRepository {


//     //create a new user
//     async createUser(userData: Partial<IuserDocument>): Promise<IuserDocument> {
//         const user = new userModel(userData)
//         console.log("@repo", user)
//         return user.save()
//     }



//     ///find a user by email
//     async findByEmail(email: string): Promise<IuserDocument | null> {
//         return userModel.findOne({ email })
//     }



//     async getAllUsers(): Promise<any> {
//         try {
//             // Fetch all users from the database using the userModel
//             const users = await userModel.find().sort({ createdAt: -1 });;
//             return users;
//         } catch (error) {
//             // Log and throw the error to be handled at the service level
//             console.error("Error in getAllUsers repository:", error);
//             throw new Error('Error fetching users from the database');
//         }
//     }



//     async createAdmin(admindata: Partial<IadminDocument>): Promise<IadminDocument> {
//         const admin = new adminModel(admindata)
//         console.log("@repo", admin)
//         return admin.save()
//     }


//     async findByEmailAndRole(email: string, role: string): Promise<IadminDocument | null> {

//         console.log("herer")
//         return adminModel.findOne({ email, role });
//     }


//     async findByEmailAdmin(email: string): Promise<IadminDocument | null> {
//         return adminModel.findOne({ email })
//     }


//     async updateProfileByUserId(userId: any, updatedFields: any): Promise<any> {
//         try {
//             console.log("Here@repi");

//             // Attempt to update the profile using the userId
//             const updatedProfile = await userModel.findByIdAndUpdate(
//                 userId, // Match by userId
//                 updatedFields, // Update fields
//                 { new: true } // Return the updated document
//             );

//             console.log("Profile updated successfully rom repoo");
//             return updatedProfile;

//         } catch (error) {
//             console.error("Error updating profile:", error);
//             throw new Error("Profile update failed"); // Re-throw the error to handle it at the higher level
//         }
//     }



//     async updateProfilePicture(useremail:string , imageUrl : string):Promise<any>{
//         try {

//             console.log(`@repo ${useremail}`)
//             const updatedUser = await userModel.findOneAndUpdate({email:useremail},{profilepicture:imageUrl},{new:true})

//             if(!updatedUser){
//                 throw new Error("user not found")
//             }
//             return updatedUser
//         } catch (error) {
//             console.error('Error updating user profile picture in the repository:', error);
//             throw error;
//         }
//     }


//     async updateUserStatus(id: string, status: string):Promise<any>{
//         try {
//             // Use Mongoose or MongoDB method to find the user by ID and update the status
//             const updatedUser = await userModel.findByIdAndUpdate(
//                 id,
//                 { status: status },
//                 { new: true } // This option returns the updated document
//             );

//             return updatedUser;
//         } catch (error) {
//             throw new Error(`Error in updating user status`);
//         }
//     }

// }


export class userRepository extends BaseRepository<IuserDocument> {
    constructor() {

        super(userModel)
    }

    // find user by email
    async findByEmail(email: string): Promise<IuserDocument | null> {
        return this.findOne({ email })
    }

    async createUser(userData: Partial<IuserDocument>): Promise<IuserDocument | null> {
        return this.save(userData)
    }



    async updateProfileByUserId(userId: any, updatedFields: any): Promise<any> {
        try {

            console.log("readhe user repo",userId , updatedFields)
            return this.findByIdAndUpdate(userId, updatedFields)
        } catch (error) {
            console.error("Error updating profile:", error);
            throw new Error("Profile update failed"); // Re-throw the error to handle it at the higher level
        }
    }


    async updateProfilePicture(userId: string, imageUrl: string): Promise<IuserDocument | null> {
        try {

            return this.findByIdAndUpdate(userId, { profilepicture: imageUrl });



        } catch (error) {
            console.error('Error updating user profile picture in the repository:', error);
            throw error;
        }
    }

    async updateSub(userId : any , channelId :any):Promise<IuserDocument | null>{
        try {


            const followingField = 'following';  // Field for user's following list
            const subscribersField = 'subscribers';  // Field for channel's subscriber list

            
            const userUpdate= this.findAndUpdateSet(userId , followingField, channelId)
            const channelupdate= this.findAndUpdateSet(channelId, subscribersField, userId)

             return userUpdate
        } catch (error) {
            console.error("error updating subscriber")
            throw error

        }
    }
    async updateUnSub(userId : any , channelId :any):Promise<IuserDocument | null>{
        try {


            const followingField = 'following';  // Field for user's following list
            const subscribersField = 'subscribers';  // Field for channel's subscriber list

            
            const userUpdate= this.uNfindAndUpdateSet(userId , followingField, channelId)
            const channelupdate= this.uNfindAndUpdateSet(channelId, subscribersField, userId)

             return userUpdate
        } catch (error) {
            console.error("error updating subscriber")
            throw error

        }
    }

    ///get all users sorted by creation date
    async getAllUsers(): Promise<IuserDocument[]> {
        try {
            const users = await userModel.find().sort({ createdAt: -1 });;
            return users;
        } catch (error) {
            console.error("Error in getAllUsers repository:", error);
            throw new Error('Error fetching users from the database');
        }
    }


    async updateUserStatus(id: string, status: string): Promise<IuserDocument | null> {
        try {
            // Use Mongoose or MongoDB method to find the user by ID and update the status
            return this.findByIdAndUpdate(id, { status: status });

        } catch (error) {
            throw new Error(`Error in updating user status`);
        }
    }



    async findUsers(nameQuery: string, loggedInUserName: string) {
        try {
            console.log("@ user repo", { nameQuery, loggedInUserName });
    
            // Use FilterQuery to include MongoDB query operators like $and
            const query: FilterQuery<IuserDocument> = {
                $and: [
                    { name: { $regex: `^${nameQuery}`, $options: 'i' } },  // Case-insensitive name matching
                    { name: { $ne: loggedInUserName } }  // Exclude the logged-in user by name
                ]
            };
    
            // const users = await this.findi(query);  
            
            const users = await userModel.find(query)
            return users;
        } catch (error) {
            throw new Error("Error while querying the database: " + error);
        }
    }
}

