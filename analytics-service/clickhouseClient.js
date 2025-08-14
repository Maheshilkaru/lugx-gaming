import { ClickHouse } from 'clickhouse';
import dotenv from 'dotenv';

dotenv.config();

// ✅ ClickHouse client for external cloud
export const clickhouse = new ClickHouse({
    url: `https://${process.env.CLICKHOUSE_HOST}`, // e.g. nul150mbpv.us-central1.gcp.clickhouse.cloud
    port: 8443, // HTTPS port
    debug: false,
    basicAuth: {
        username: process.env.CLICKHOUSE_USER,     // usually 'default'
        password: process.env.CLICKHOUSE_PASSWORD, // your password from ClickHouse cloud
    },
    isUseGzip: true,
    format: 'json', // Return JSON
    config: {
        session_timeout: 60,
        database: 'default', // your current DB in ClickHouse Cloud
    },
});

// ✅ Insert function
export async function insertEvent(event) {
    try {
        const query = `
            INSERT INTO analytics_events 
            (event_type, page_url, session_id, element, time_on_page, scroll_depth, session_duration, timestamp)
            VALUES
        `;

        // ClickHouse client expects array of arrays for batch insert
        await clickhouse.insert(query, [
            [
                event.event_type,
                event.page_url,
                event.session_id,
                event.element || '',
                parseFloat(event.time_on_page) || 0,
                parseFloat(event.scroll_depth) || 0,
                parseFloat(event.session_duration) || 0,
                event.timestamp
            ]
        ]).toPromise();

        console.log(`✅ Inserted event into ClickHouse: ${event.event_type} - ${event.page_url}`);
    } catch (err) {
        console.error("❌ ClickHouse insert error:", err.message);
    }
}
