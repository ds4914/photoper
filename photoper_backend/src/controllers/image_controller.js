import Event from "../models/event_model.js";

const uploadImageNames = async (req, res) => {
    try {
        const { eventId, password, imageNames } = req.body;
        if (!eventId || !password || !Array.isArray(imageNames)) {
            return res.status(400).json({ message: "Invalid request. Provide eventId, password, and an array of imageNames.", data: {} });
        }

        const event = await Event.findOne({ eventId });
        if (!event) return res.status(404).json({ message: "Event not found", data: {} });
        if (event.password !== password) return res.status(401).json({ message: "Invalid password", data: {} });

        event.imageNames = [...new Set([...(event.imageNames || []), ...imageNames])];
        await event.save();

        res.status(200).json({ message: "Image names uploaded successfully", data: { imageNames: event.imageNames } });
    } catch (error) {
        console.error("Error uploading image names:", error);
        res.status(500).json({ message: "Internal Server Error", data: {} });
    }
};

const getEventImages = async (req, res) => {
    try {
        const { eventId, password, category } = req.body;

        if (!eventId || !password) {
            return res.status(400).json({ message: "Event ID and password are required", data: {} });
        }

        const event = await Event.findOne({ eventId }).lean();
        if (!event) return res.status(404).json({ message: "Event not found", data: {} });
        if (event.password !== password) return res.status(401).json({ message: "Invalid password", data: {} });

        let images;
        if (category) {
            images = event.categorizedImages?.[category] || [];
        } else {
            images = event.images;
        }

        res.status(200).json({ message: "Images fetched successfully", data: { images } });
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ message: "Internal Server Error", data: {} });
    }
};

const getSelectedImages = async (req, res) => {
    try {
        const { eventId, password } = req.body;

        if (!eventId || !password) {
            return res.status(400).json({ message: "Invalid request. Provide eventId and password.", data: {} });
        }

        const event = await Event.findOne({ eventId });
        if (!event) return res.status(404).json({ message: "Event not found", data: {} });

        if (event.password !== password) {
            return res.status(401).json({ message: "Invalid password", data: {} });
        }

        res.status(200).json({ 
            message: "Uploaded images fetched successfully", 
            data: { imageNames: event.imageNames } 
        });
    } catch (error) {
        console.error("Error fetching uploaded images:", error);
        res.status(500).json({ message: "Internal Server Error", data: {} });
    }
};


export { getEventImages, uploadImageNames, getSelectedImages };
