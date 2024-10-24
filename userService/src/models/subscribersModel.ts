import mongoose, { Document, Schema } from "mongoose";

export interface ISubscriberDocument extends Document {
    userId: mongoose.Types.ObjectId; // The subscriber user
    subscribedUserId: mongoose.Types.ObjectId; // The user who is being subscribed to
    createdAt: Date; // Date when the subscribe action occurred
}


const subscriberSchema: Schema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'StreamioUser', // Reference to the User collection
        required: true,
    },
    subscribedUserId: {
        type: mongoose.Types.ObjectId,
        ref: 'StreamioUser', // Reference to the User collection
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create the model for subscribers
const SubscriberModel = mongoose.model<ISubscriberDocument>('Subscriber', subscriberSchema);

export default SubscriberModel;