import httpntlm from "httpntlm";

const BASE_URL = process.env.D365_BASE_URL;
const USERNAME = process.env.D365_USERNAME;
const PASSWORD = process.env.D365_PASSWORD;
const DOMAIN = process.env.D365_DOMAIN;

export interface CompletedIncident {
  callNumber: number;
  completedOn: string;
  owner: string | null;
  title: string | null;
  incidentId: string;
}

export interface OwnerCount {
  owner: string;
  count: number;
}

function buildFetchXml(dateFilter: string | null = "today"): string {
  let filterXml: string;

  if (dateFilter === "today") {
    filterXml = `
    <filter type="and">
      <condition attribute="mjs_incidentstatus" operator="eq" value="1" />
      <condition attribute="enjoy_process_date6" operator="today" />
    </filter>`;
  } else if (dateFilter) {
    filterXml = `
    <filter type="and">
      <condition attribute="mjs_incidentstatus" operator="eq" value="1" />
      <condition attribute="enjoy_process_date6" operator="on" value="${dateFilter}" />
    </filter>`;
  } else {
    filterXml = `
    <filter type="and">
      <condition attribute="mjs_incidentstatus" operator="eq" value="1" />
      <condition attribute="enjoy_process_date6" operator="not-null" />
    </filter>`;
  }

  return `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
  <entity name="incident">
    <attribute name="mjs_callnumber" />
    <attribute name="ticketnumber" />
    <attribute name="title" />
    <attribute name="incidentid" />
    <attribute name="enjoy_process_date6" />
    <attribute name="mjs_incidentstatus" />${filterXml}
    <order attribute="enjoy_process_date6" descending="true" />
    <link-entity name="systemuser" from="systemuserid" to="owninguser" link-type="outer" alias="owner">
      <attribute name="fullname" />
    </link-entity>
  </entity>
</fetch>`;
}

interface D365Response {
  value: Array<{
    mjs_callnumber?: number;
    enjoy_process_date6?: string;
    "owner_x002e_fullname"?: string;
    title?: string;
    incidentid?: string;
  }>;
}

function httpntlmGet(url: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    httpntlm.get(
      {
        url,
        username: USERNAME || "",
        password: PASSWORD || "",
        domain: DOMAIN || "",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
      (err: Error | null, res: { statusCode: number; body: string }) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
}

export async function fetchCompletedIncidents(
  dateFilter: string | null = "today"
): Promise<CompletedIncident[]> {
  if (!BASE_URL) {
    throw new Error("D365_BASE_URL is not configured");
  }

  const fetchXml = buildFetchXml(dateFilter);
  const encodedFetchXml = encodeURIComponent(fetchXml);
  const url = `${BASE_URL}/incidents?fetchXml=${encodedFetchXml}`;

  const response = await httpntlmGet(url);

  if (response.statusCode !== 200) {
    throw new Error(`D365 API error: ${response.statusCode}`);
  }

  const data: D365Response = JSON.parse(response.body);
  const records = data.value || [];

  return records.map((record) => ({
    callNumber: record.mjs_callnumber || 0,
    completedOn: record.enjoy_process_date6 || "",
    owner: record["owner_x002e_fullname"] || null,
    title: record.title || null,
    incidentId: record.incidentid || "",
  }));
}

export function groupByOwner(incidents: CompletedIncident[]): OwnerCount[] {
  const ownerMap = new Map<string, number>();

  for (const incident of incidents) {
    const owner = incident.owner || "未割当";
    ownerMap.set(owner, (ownerMap.get(owner) || 0) + 1);
  }

  const result: OwnerCount[] = [];
  for (const [owner, count] of ownerMap) {
    result.push({ owner, count });
  }

  // Sort by count descending
  result.sort((a, b) => b.count - a.count);

  return result;
}

export function formatDateTimeJST(utcDateStr: string): string {
  if (!utcDateStr) return "N/A";

  try {
    const date = new Date(utcDateStr);
    // Add 9 hours for JST
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const year = jstDate.getUTCFullYear();
    const month = String(jstDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(jstDate.getUTCDate()).padStart(2, "0");
    const hours = String(jstDate.getUTCHours()).padStart(2, "0");
    const minutes = String(jstDate.getUTCMinutes()).padStart(2, "0");
    const seconds = String(jstDate.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return utcDateStr;
  }
}
