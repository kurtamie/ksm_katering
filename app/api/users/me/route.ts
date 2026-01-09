import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStrapiURL } from "@/lib/utils";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token) {
    return NextResponse.json(
      {
        data: null,
        error: {
          status: 401,
          name: "UnauthorizedError",
          message: "Unauthorized",
          details: {},
        },
      },
      { status: 401 }
    );
  }

  const url = new URL(getStrapiURL("/api/users/me"));
  url.search = new URL(request.url).search;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
