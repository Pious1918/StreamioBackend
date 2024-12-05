import mongoose , {Document , Schema} from 'mongoose'

interface IBannerDocument extends Document{

    imageUrl:string,
    title:string,
    description:string
}


const bannerSchema :Schema = new Schema({
    image:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }
})

const bannerModel = mongoose.model<IBannerDocument>('banner',bannerSchema)

export default bannerModel