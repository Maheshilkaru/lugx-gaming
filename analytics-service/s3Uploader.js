import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Configure S3 client with credentials from environment variables
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Upload batch of events to S3
export async function uploadBatchToS3(batch) {
    try {
        // Convert batch to CSV content
        const csvContent =
            "event_type,page_url,session_id,element,time_on_page,scroll_depth,session_duration,timestamp\n" +
            batch.map(e => 
                `${e.event_type},${e.page_url},${e.session_id},${e.element || ""},${e.time_on_page || 0},${e.scroll_depth || 0},${e.session_duration || 0},${e.timestamp}`
            ).join("\n");

        // Create a temporary file for this batch
        const fileName = `events_${Date.now()}.csv`;
        const filePath = path.join("/tmp", fileName);
        fs.writeFileSync(filePath, csvContent);

        // Upload to S3
        await s3.upload({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `analytics/${fileName}`,
            Body: fs.createReadStream(filePath),
            ContentType: "text/csv"
        }).promise();

        console.log(`Uploaded batch to S3: ${fileName}`);

        // Delete local file after upload
        fs.unlinkSync(filePath);

    } catch (err) {
        console.error("S3 upload failed:", err.message);
        throw err;
    }
}