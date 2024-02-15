import { ResourceServerResponse } from "@/dto/resourceServerResponse";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tokenValue = cookies().get("accessToken")?.value;

  // User does not have a token => no need to call auth/resource server
  if (!tokenValue) {
    redirect("/login");
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/image/${params.id}`,
      {
        headers: {
          Authorization: "Bearer " + tokenValue,
        },
      }
    );

    if (res.status === 401) {
      redirect("/login");
    }

    if (!res.ok) {
      const errorResponse: ResourceServerResponse = await res.json();
      throw new Error(errorResponse.message);
    }

    const blob = await res.blob();

    return new Response(blob);
  } catch (error) {
    throw new Error("Resource Server not reachable, try again");
  }
}
