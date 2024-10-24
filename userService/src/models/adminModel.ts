
import mongoose , {Document , Schema} from "mongoose";

export interface IadminDocument extends Document{
    name : string;
    email : string;
    password : string;
    phonenumber : string;
    country : string;
    profilepicture:string;
    role: string; // admin role field
    createdAt : Date;
    updatedAt : Date;

}



const adminSchema : Schema = new Schema({

    name:{
        type:String,
        required:true,
        unique : true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    phonenumber:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    profilepicture:{
        type:String
    },
    role:{ 
        type: String, 
        
        default: 'admin' 
    }, // Default role is user
    
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
})

const adminModel = mongoose.model<IadminDocument>('StreamioAdmin' , adminSchema)

export default adminModel;