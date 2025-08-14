// clickhouseClient.js
import axios from 'axios';
import https from 'node:https';
import dotenv from 'dotenv';

dotenv.config();

const CH_HOST = process.env.CLICKHOUSE_HOST;      // e.g. nu1i50mbpv.us-central1.gcp.clickhouse.cloud
const CH_USER = process.env.CLICKHOUSE_USER || 'default';
const CH_PASS = process.env.CLICKHOUSE_PASSWORD;

// Keep TCP/TLS alive and force TLS >= 1.2 (required by CH Cloud)
const httpsAgent = new https.Agent({
  keepAlive: true,
  minVersion: 'TLSv1.2',
});

// One axios client for all calls
const ch = axios.create({
  baseURL: `https://${CH_HOST}:8443`,            // HTTPS endpoint
  httpsAgent,
  auth: { username: CH_USER, password: CH_PASS }, // Basic auth
  headers: { 'Content-Type': 'text/plain' },      // IMPORTANT for CH HTTP API
  timeout: 10000,
});

// Insert one event using JSONEachRow (safe & fast)
export async function insertEvent(evt) {
  // Map to your table columns exactly as created in ClickHouse
  const row = {
    event_type: evt.event_type,
    page_url: evt.page_url,
    session_id: evt.session_id,
    element: evt.element ?? null,
    time_on_page: evt.time_on_page ?? null,
    scroll_depth: evt.scroll_depth ?? null,
    session_duration: evt.session_duration ?? null,
    timestamp: evt.timestamp, // ISO8601 is OK
  };

  // SQL + payload (CH expects a newline after FORMAT JSONEachRow)
  const body =
    'INSERT INTO analytics_events ' +
    '(event_type,page_url,session_id,element,time_on_page,scroll_depth,session_duration,timestamp) ' +
    'FORMAT JSONEachRow\n' +
    JSON.stringify(row) + '\n';

  try {
    await ch.post('/?database=default', body);  // default DB – change if needed
    // console.log('CH insert OK');
  } catch (e) {
    console.error('❌ ClickHouse insert error:', e?.message || e);
    throw e;
  }
}
