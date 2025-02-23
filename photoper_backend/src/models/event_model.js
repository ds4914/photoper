import mongoose from "mongoose";

const eventSchema =  new mongoose.Schema(
    {
        eventId: {
            type: String,
            unique: true,
            default: function () {
                return new mongoose.Types.ObjectId().toHexString(); // ✅ Corrected with `new`
            },
        },
        
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        event_date: { // Renamed from `date`
            type: Date,
            required: true,  // Make it mandatory
        },
        images: {
            type: [String],
            default: [],
        },
        videos: {
            type: [String],
            default: [],
        },
        password: {
            type: String,
            required: true,
            default: function () {
                const titlePart = this.title
                    ? this.title.replace(/\s+/g, "").substring(0, 4).toUpperCase()
                    : "EVNT";
                const randomDigits = Math.floor(1000 + Math.random() * 9000);
                return `${titlePart}${randomDigits}`;
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
        imageNames: {
            type: [String],
            default: [],
        },
        categorizedImages: {
            type: Map,  // Stores categories dynamically
            of: [String],  // Array of image URLs per category
            default: {},
        },
    },
    { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;  // Default export
