import { uploadBatchToS3 } from "./s3Uploader.js";

// 🔹 Buffer to store events temporarily
const buffer = [];

// 🔹 Configuration
const BATCH_SIZE = 10;         // Upload to S3 every 10 events
const BATCH_INTERVAL = 60000;  // Or every 60 seconds

// ✅ Add new event to buffer
export function addEventToBuffer(event) {
    buffer.push(event);

    // If buffer reached batch size → upload immediately
    if (buffer.length >= BATCH_SIZE) {
        flushBuffer();
    }
}

// ✅ Flush buffer (upload all events to S3)
function flushBuffer() {
    if (buffer.length === 0) return;

    // Copy current buffer and clear
    const batch = [...buffer];
    buffer.length = 0;

    // Upload batch to S3
    uploadBatchToS3(batch)
        .then(() => console.log(`✅ Uploaded ${batch.length} events to S3`))
        .catch(err => console.error("❌ S3 upload error:", err.message));
}

// 🔹 Auto-flush buffer periodically
setInterval(flushBuffer, BATCH_INTERVAL);