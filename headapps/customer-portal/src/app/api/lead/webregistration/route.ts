import { NextRequest, NextResponse } from "next/server";

/**
 * Request body for lead web registration.
 * Matches the Intralox lead API payload.
 */
export interface LeadWebRegistrationBody {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  jobRole: string;
  industryTeam: string;
  industry: string;
  leadSource: string;
  externalUserOktaId: string;
  country?: string;
  language?: string;
  campaign?: string;
}

const INTRALOX_LEAD_API_URL =
  process.env.INTRALOX_LEAD_API_URL ||
  "https://apidev.intralox.com/v1/lead/webregisteration";

// TODO: Replace with process.env.INTRALOX_LEAD_API_TOKEN before production
const INTRALOX_LEAD_API_TOKEN =
  "eyJ4NXQjUzI1NiI6InBQSDQtUHZZVVJTdmJqR3BPZlJrdXFCRGZnelo1clB4WUVsT2ZWMXBNTDQiLCJ4NXQiOiJVTTN2Z0lUbEVSSlVocDcycEU3ZE51UkY0YWciLCJraWQiOiJTSUdOSU5HX0tFWSIsImFsZyI6IlJTMjU2In0.eyJjbGllbnRfb2NpZCI6Im9jaWQxLmRvbWFpbmFwcC5vYzEuaWFkLmFtYWFhYWFhYXF0cDViYWF5cDc2Znk0NGdzNzRjemVndmhxbGtkZnBzaWpydnYzNzJtN3M1NWFpM29rcSIsInVzZXJfdHoiOiJBbWVyaWNhL0NoaWNhZ28iLCJzdWIiOiJvaWNvYXV0aGRldi1zdmMiLCJ1c2VyX2xvY2FsZSI6ImVuIiwic2lkbGUiOjQ4MCwidXNlci50ZW5hbnQubmFtZSI6ImlkY3MtOTkwNzI4MzJjNDI5NDEzMTgyMTNiYjU3OWY2NzgxMDgiLCJpc3MiOiJodHRwczovL2lkZW50aXR5Lm9yYWNsZWNsb3VkLmNvbS8iLCJkb21haW5faG9tZSI6InVzLWFzaGJ1cm4tMSIsImNhX29jaWQiOiJvY2lkMS50ZW5hbmN5Lm9jMS4uYWFhYWFhYWFqcnJ4eXdoeWJocmk1dzVoeG9yZ3FveGI0bGJlcnlsa3Q0cnVva3hkbmc3Z3dqYXJsYW1xIiwidXNlcl90ZW5hbnRuYW1lIjoiaWRjcy05OTA3MjgzMmM0Mjk0MTMxODIxM2JiNTc5ZjY3ODEwOCIsImNsaWVudF9pZCI6IjE0NTEzNDJjZjViODRmNDRiNTZiYmUzYjMwMjBiM2YwIiwiZG9tYWluX2lkIjoib2NpZDEuZG9tYWluLm9jMS4uYWFhYWFhYWF2ZmtsN2Y1YmVyaHVoY3ZhczQ0cGI3dm10MnBndHZ6d2NzeDc2bTc3dG02c3I0dmY1N2txIiwic3ViX3R5cGUiOiJ1c2VyIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyB1cm46b3BjOnJlc291cmNlOmNvbnN1bWVyOjphbGwiLCJ1c2VyX29jaWQiOiJvY2lkMS51c2VyLm9jMS4uYWFhYWFhYWFwbGRoNmFzcnJ3emJ5NHdyYmdlZHdjNGE2Y2xmcGp2NnNvZjRka3J3cWt1c2p4eTV4NW1xIiwiY2xpZW50X3RlbmFudG5hbWUiOiJpZGNzLTk5MDcyODMyYzQyOTQxMzE4MjEzYmI1NzlmNjc4MTA4IiwicmVnaW9uX25hbWUiOiJ1cy1hc2hidXJuLWlkY3MtMSIsInVzZXJfbGFuZyI6ImVuIiwiZXhwIjoxNzczMTQ0NTE1LCJpYXQiOjE3NzMxNDA5MTUsImNsaWVudF9ndWlkIjoiZjQ1M2UzMzc5YjgxNDRlYzkxMzFkMzFlOTc3YmNkNTEiLCJjbGllbnRfbmFtZSI6IklMT1gtT0lDREVWLU9BVVRIIiwidGVuYW50IjoiaWRjcy05OTA3MjgzMmM0Mjk0MTMxODIxM2JiNTc5ZjY3ODEwOCIsImp0aSI6ImI0YzEyYjhkMmNmNTQ3Mzk5MjQ1ZDhiZWZlNDVhZDgwIiwiZ3RwIjoicm8iLCJ1c2VyX2Rpc3BsYXluYW1lIjoib2ljb2F1dGggZGV2Iiwib3BjIjpmYWxzZSwic3ViX21hcHBpbmdhdHRyIjoidXNlck5hbWUiLCJwcmltVGVuYW50Ijp0cnVlLCJ0b2tfdHlwZSI6IkFUIiwiY2FfZ3VpZCI6ImNhY2N0LTBkZTA1YmUzOTI1ZjQxZTI4NGUwYWM4NmE4YzEwNjA4IiwiYXVkIjpbImh0dHBzOi8vNkM0NTZGNjYxMEE1NDEyMEIzNDg2RTMzN0Y0NkQ3OTYuYnVpbGRlci51cy1hc2hidXJuLTEub2NwLm9yYWNsZWNsb3VkLmNvbTo0NDMiLCJodHRwczovL3Vzbm9pYy1lYnMtZGV2LWlkaWxqcHVscXJmdS1pYS5pbnRlZ3JhdGlvbi5vY3Aub3JhY2xlY2xvdWQuY29tOjQ0MyIsInVybjpvcGM6bGJhYXM6bG9naWNhbGd1aWQ9NTZERUZFMUU1RTNENEY0MzgzREE4RUNDRDYyMkQ1REMiLCJodHRwczovLzU2REVGRTFFNUUzRDRGNDM4M0RBOEVDQ0Q2MjJENURDLmludGVncmF0aW9uLm9jcC5vcmFjbGVjbG91ZC5jb206NDQzIiwiaHR0cHM6Ly91c25vaWMtZWJzLWRldi1pZGlsanB1bHFyZnUtaWEudWkucnBhLmludGVncmF0aW9uLnVzLWFzaGJ1cm4tMS5vY3Aub3JhY2xlY2xvdWQuY29tIiwiaHR0cHM6Ly9vaWMtdmJjcy11c25vaWMtZWJzLWRldi12Yi1pZGlsanB1bHFyZnUuYnVpbGRlci51cy1hc2hidXJuLTEub2NwLm9yYWNsZWNsb3VkLmNvbTo0NDMiLCJodHRwczovL3Vzbm9pYy1lYnMtZGV2LWlkaWxqcHVscXJmdS1pYS5pbnRlZ3JhdGlvbi51cy1hc2hidXJuLTEub2NwLm9yYWNsZWNsb3VkLmNvbTo0NDMiLCJodHRwczovL2Rlc2lnbi5pbnRlZ3JhdGlvbi51cy1hc2hidXJuLTEub2NwLm9yYWNsZWNsb3VkLmNvbT9pbnRlZ3JhdGlvbkluc3RhbmNlPXVzbm9pYy1lYnMtZGV2LWlkaWxqcHVscXJmdS1pYSIsImh0dHBzOi8vdXNub2ljLWVicy1kZXYtaWRpbGpwdWxxcmZ1LWlhLnJwYS5pbnRlZ3JhdGlvbi51cy1hc2hidXJuLTEub2NwLm9yYWNsZWNsb3VkLmNvbSJdLCJjYV9uYW1lIjoiaW50cmFsb3hpbmMiLCJ1c2VyX2lkIjoiMDVlMjgwMDgxMjllNDBiMzk4MDM0MGE1NWQ0MjI0YzciLCJydF9qdGkiOiJhMDNkMTM3YmU1MTM0MjVjODkyNDE3Njk0M2Y4NmQ2YiIsImRvbWFpbiI6Ik9yYWNsZUlkZW50aXR5Q2xvdWRTZXJ2aWNlIiwidGVuYW50X2lzcyI6Imh0dHBzOi8vaWRjcy05OTA3MjgzMmM0Mjk0MTMxODIxM2JiNTc5ZjY3ODEwOC5pZGVudGl0eS5vcmFjbGVjbG91ZC5jb206NDQzIiwicmVzb3VyY2VfYXBwX2lkIjoiZDhmY2VhNjk4MjZkNGQ0ZDgxODM3ZjBiOTAzZDhiYzAifQ.s4303eft4APt5CHWTsWF4e-VZpTk0vqlQl-5B3uEqqIWufH14vHdE2vKmrgjPMp6gMBvsmH5m5WU2-QOAO-41277eGOqMzjiu9HHLOpZD85nE5utuyaRmz5bRum6wRsXwPN-EU9PkednPAj1Z18xEge6r7U75_H9IBw_fzzCoeRhcIU3aQDfeKk6sbLqr8lglNGQthrACCUHD1iKzmQes3f1RVC5j-Ybj65nVI7T7cAZyuGv9CCBFiUTd3K4w4Xu_8bFzpWkq8TB-IuFsLIYrTvPMh_WLVTPpCKXfLjGZioDZT8anTyYdhfeQsST1ymHgiMVUN8NvrB656xnZKdHbQ";

/**
 * POST /api/lead/webregistration
 * Proxies lead web registration to the Intralox lead API.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LeadWebRegistrationBody;
    const payload: LeadWebRegistrationBody = {
      email: body?.email ?? "",
      firstName: body?.firstName ?? "",
      lastName: body?.lastName ?? "",
      companyName: body?.companyName ?? "",
      jobRole: body?.jobRole ?? "",
      industryTeam: body?.industryTeam ?? "",
      industry: body?.industry ?? "",
      leadSource: body?.leadSource ?? "CustomerPortal",
      externalUserOktaId: body?.externalUserOktaId ?? "",
      country: body?.country ?? "",
      language: body?.language ?? "",
      campaign: body?.campaign ?? "",
    };

    const response = await fetch(INTRALOX_LEAD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${INTRALOX_LEAD_API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const rawResponse = await response.text();
    const apiResponse = (() => {
      if (!rawResponse.trim()) return {};
      try {
        return JSON.parse(rawResponse) as Record<string, unknown>;
      } catch {
        return {};
      }
    })();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "lead_registration_failed",
          message: (apiResponse as { message?: string })?.message ?? "Lead registration failed",
          apiResponse,
          rawResponse,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ...apiResponse,
      apiResponse,
      rawResponse,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const cause = (err as Error & { cause?: unknown }).cause;
    const causeWithSocket = cause as Error & { code?: string; socket?: { localAddress?: string; localPort?: number; remoteAddress?: string; remotePort?: number; bytesWritten?: number; bytesRead?: number } };
    const causeObj =
      cause instanceof Error
        ? {
            name: cause.name,
            message: cause.message,
            code: causeWithSocket.code,
            stack: cause.stack,
            ...(causeWithSocket.socket && {
              socket: {
                localAddress: causeWithSocket.socket.localAddress,
                localPort: causeWithSocket.socket.localPort,
                remoteAddress: causeWithSocket.socket.remoteAddress,
                remotePort: causeWithSocket.socket.remotePort,
                bytesWritten: causeWithSocket.socket.bytesWritten,
                bytesRead: causeWithSocket.socket.bytesRead,
              },
            }),
          }
        : { raw: String(cause) };

    const logPayload = {
      message: "Lead web registration error",
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        cause: causeObj,
      },
      context: {
        url: INTRALOX_LEAD_API_URL,
        timestamp: new Date().toISOString(),
      },
    };
    console.error("[lead/webregistration]", JSON.stringify(logPayload, null, 2));
    console.error(err);

    return NextResponse.json(
      {
        error: "internal_error",
        message: "An error occurred while submitting lead registration",
      },
      { status: 500 }
    );
  }
}
