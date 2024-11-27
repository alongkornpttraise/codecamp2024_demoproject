import { NextResponse } from "next/server";
import { fetchUser } from "@/app/lib/data";

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json(); // Parse the request body

    // Find the user by email in the database
    const user = await fetchUser(email, role);

    // If the user is not found, return a 404 response
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the username and role of the user
    return NextResponse.json(
      {
        userId: user.user_id,
        username: user.user_name,
        role: user.roles[0].role.role_name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    // Return a 500 response in case of a server error
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
