import express from "express";
import bodyParser from "body-parser";
import { insertEvent } from "./clickhouseClient.js";
import { addEventToBuffer } from "./eventsBuffer.js";

const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get("/", (req, res) => {
    res.send("✅ Analytics Service is running!");
});

// POST /events
app.post("/events", async (req, res) => {
    try {
        const { event_type, page_url, session_id, element, time_on_page, scroll_depth, session_duration } = req.body;

        if (!event_type || !page_url || !session_id) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        const timestamp = new Date().toISOString();

        // 1️⃣ Insert into ClickHouse
        await insertEvent({ event_type, page_url, session_id, element, time_on_page, scroll_depth, session_duration, timestamp });

        // 2️⃣ Add to buffer for S3 upload
        addEventToBuffer({ event_type, page_url, session_id, element, time_on_page, scroll_depth, session_duration, timestamp });

        console.log(`📥 Event recorded: ${event_type} - ${page_url} - ${session_id}`);
        res.status(200).send({ message: "Event recorded successfully" });
    } catch (err) {
        console.error("❌ Error recording event:", err.message);
        res.status(500).send({ error: "Failed to record event" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Analytics Service running on port ${PORT}`);
});