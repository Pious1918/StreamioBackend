import mongoose , {Document , Schema} from 'mongoose'

interface Iotp extends Document{
    email:string,
    otp:string,
    expiresAt:Date
}


const otpSchema : Schema = new Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true
    }
})

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


const otpModel = mongoose.model<Iotp>('otp',otpSchema)

export default otpModel