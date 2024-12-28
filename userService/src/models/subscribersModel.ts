import mongoose, { Document, Schema } from "mongoose";

export interface ISubscriberDocument extends Document {
    userId: mongoose.Types.ObjectId;
    subscribedUserId: mongoose.Types.ObjectId; 
    createdAt: Date; 
}


const subscriberSchema: Schema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'StreamioUser', // Reference to the User collection
        required: true,
    },
    subscribedUserId: {
        type: mongoose.Types.ObjectId,
        ref: 'StreamioUser',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const SubscriberModel = mongoose.model<ISubscriberDocument>('Subscriber', subscriberSchema);

export default SubscriberModel;