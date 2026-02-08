import { NextRequest, NextResponse } from "next/server";
import {
  fetchCompletedIncidents,
  groupByOwner,
  formatDateTimeJST,
} from "@/lib/d365";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || "today";

    const incidents = await fetchCompletedIncidents(date);
    const ownerCounts = groupByOwner(incidents);

    // Format dates for response
    const formattedIncidents = incidents.map((incident) => ({
      ...incident,
      completedOnJST: formatDateTimeJST(incident.completedOn),
    }));

    return NextResponse.json({
      success: true,
      date: date,
      totalCount: incidents.length,
      ownerCounts,
      incidents: formattedIncidents,
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
