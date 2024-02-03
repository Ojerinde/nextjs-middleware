const fs = require("fs");
import { NextResponse } from "next/server";

// Dummy user data (loaded from users.jso
const userData = require("@/utils/token-based-authenticated-users.json");

interface SignupFormDataType {
  username: string;
  password: string;
}

// API route handler
export async function POST(request: Request) {
  const { username, password } = (await request.json()) as SignupFormDataType;

  if (!username || !password) {
    return NextResponse.json({ message: "Signup fail" }, { status: 400 });
  }

  userData.users.push({ username, password, id: userData.users.length + 1 });

  // Save the updated user data back to users.json (in a real app, use a database)
  fs.writeFileSync(
    `utils/token-based-authenticated-users.json`,
    JSON.stringify(userData, null, 2)
  );

  return NextResponse.json({ message: "Signup successful" }, { status: 201 });
}
