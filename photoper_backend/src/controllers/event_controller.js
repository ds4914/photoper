import Event from "../models/event_model.js";
import { deleteFromCloudinary } from "../middlewares/upload.js";


export const createEvent = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized: user ID not found", data: {} });
        }

        let { eventId, title, description, event_date } = req.body;

        let images = req.processedImages || [];
        let videos = req.processedVideos || [];

        if (eventId) {
            // Updating an existing event
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(404).json({ message: "Event not found", data: {} });
            }

            event.images = Array.from(new Set([...event.images, ...images]));
            event.videos = Array.from(new Set([...event.videos, ...videos]));

            if (event_date) {
                event.event_date = new Date(event_date);
            }

            await event.save();

            return res.status(200).json({
                message: "Event updated successfully",
                data: {
                    eventId: event._id,
                    title: event.title,
                    description: event.description,
                    event_date: event.event_date,
                    images: event.images,
                    videos: event.videos,
                    createdAt: event.createdAt,
                },
            });
        } else {
            // Creating a new event
            if (!title || !description || !event_date) {
                return res.status(400).json({ message: "Title, description, and event date are required", data: {} });
            }

            const newEvent = new Event({
                title,
                description,
                event_date: new Date(event_date),
                images,
                videos,
                createdBy: req.userId,
            });

            await newEvent.save();

            return res.status(201).json({
                message: "Event created successfully",
                data: {
                    eventId: newEvent._id,
                    title: newEvent.title,
                    description: newEvent.description,
                    event_date: newEvent.event_date,
                    images: newEvent.images,
                    videos: newEvent.videos,
                    createdAt: newEvent.createdAt,
                },
            });
        }
    } catch (error) {
        console.error("❌ Error in createEvent:", error);
        return res.status(500).json({ message: "Internal Server Error", data: {} });
    }
};

export const getEventById = async (req, res) => {
    console.log("API Hit: getEventById",req.userId);
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized: user ID not found", data: {} });
        }

        const eventId = req.query.eventId || req.params.eventId;
        console.log("Received eventId:", eventId);

        if (!eventId) {
            return res.status(400).json({ message: "Event ID is required", data: {} });
        }

        const event = await Event.findOne({ eventId: eventId }).select(
            "eventId title description event_date images videos createdAt password"
        );

        if (!event) {
            return res.status(404).json({ message: "Event not found", data: {} });
        }

        res.status(200).json({ message: "Event fetched successfully", data: event });
    } catch (error) {
        console.error("Error fetching event details:", error);
        res.status(500).json({ message: "Internal Server Error", data: {} });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized: Admin ID not found", data: {} });
        }

        console.log("API Hit check");

        const data = await Event.find({ createdBy: req.userId })
            .select("eventId title description event_date images videos createdAt password")
            .sort({ createdAt: -1 });

        if (data.length === 0) {
            return res.status(404).json({ message: "No events found for this photographer", data: {} });
        }

        const formattedData = data.map(event => ({
            eventId: event.eventId,
            title: event.title,
            description: event.description,
            event_date: event.event_date,
            createdAt: event.createdAt,
            password: event.password,
            image_count: event.images.length,
            video_count: event.videos.length
        }));

        res.status(200).json({ message: "Events fetched successfully", data: formattedData });
    } catch (error) {
        console.error("Error fetching photographer's events:", error);
        res.status(500).json({ message: "Internal Server Error", data: {} });
    }
};


export const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!eventId) {
            return res.status(400).json({ message: "Event ID is required", data: {} });
        }

        const event = await Event.findOne({ eventId });
        if (!event) {
            return res.status(404).json({ message: "Event not found", data: {} });
        }
        await Promise.all(event.images.map((url) => deleteFromCloudinary(url)));
        await Promise.all(event.videos.map((url) => deleteFromCloudinary(url)));

        await Event.deleteOne({ eventId });

        return res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", data: {} });
    }
};
