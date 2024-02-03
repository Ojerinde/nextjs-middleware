# A Dive into Middleware in NextJs

In web development, middleware plays a crucial role, acting as a bridge that connects or links various functions or components, thereby simplifying interactions between different elements..

This article aims to illustrate the application of middleware for server-side logic in Next.js, particularly in tasks such as securing routes and automatically redirecting users by validating a token's status in a token-based system.

In the context of Next.js, middleware runs before routes are matched. It enables you to execute code before completing a request, allowing you to modify responses by rewriting, redirecting, adjusting request or response headers, or responding directly. This article will guide you through utilizing these features to enhance the security of your app.

## What challenges are encountered with authentication in Next.js?

Let's explore the challenges encountered with authentication in Next.js:

- Establishing and maintaining secure user sessions.
- Defining and enforcing granular access controls.
- Implementing effective token-based authentication.
- Establishing logging and monitoring practices.
- Ensuring secure integration with external identity providers.
- Guarding against Cross-Site Request Forgery (CSRF) attacks.

To overcome these challenges, we can address them by creating a middleware file. How? This involves developing logic for secure session validation, improving control over permissions through role-based access checks, validating tokens for secure authentication, managing secure data exchange, and capturing authentication events for logging and monitoring purposes, depending on the needs of your application.

The primary reason middleware is secure is that it runs on the server-side, handling tasks such as authentication, validation, and other server-specific operations. Since it doesn't get sent to the client's browser, the logic remains on the server, making it less susceptible to client-side attacks. This inherent security is why middleware is well-suited for these critical tasks.

## Step-by-Step Guide to Implementing Middleware

Without further ado, lets dive right into it.

To keep this article concise, I've shared a starter file for you to follow. Access it [here](url here). If you need guidance on cloning or downloading, refer to this [article](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository).

I won't delve deeply into the server or backend code in this article, given our focus on middleware. Nonetheless, I'll provide a walkthrough of the starter file's code to assist you in getting started.

Let's begin with our database. For this article, I'm using a JSON file. However, in your application, you'll likely use a database.

<!-- /utils/token-based-authenticated-users.json -->

```jsx
{
  "users": [
    {
      "id": 1,
      "username": "user1",
      "password": "password123"
    },
    {
      "id": 2,
      "username": "user2",
      "password": "pass456"
    }
  ]
}
```

I'll use Next.js API routes to handle server requests. I've established two route handlers, `/api/login` and `/api/signup`. The demonstration of signup page functionalities isn't covered here; it's a task for you to explore, with the logic already in place.

<!-- app/api/signup/route.tsx -->

```jsx
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
```

Simply put, the code in the snippet above takes the data from the form in the request, does some basic checks, adds it to our fake data list, and sends back a response. In a real application, you'll go beyond this basic step. You'll connect to your database, introduce additional features such as password hashing, and implement other functionalities.

<!-- app/api/login/route.tsx -->

```jsx
const jwt = require("jsonwebtoken");
import { NextResponse } from "next/server";
// Dummy user data (loaded from users.jso
const userData = require("@/utils/token-based-authenticated-users.json");

export interface LoginFormDataType {
  username: string;
  password: string;
}

// Function to generate a JWT with user information
function generateToken(user: {
  username: string;
  password: string;
  id: string;
}) {
  // Include relevant user information in the token
  const payload = {
    userId: user.id,
    username: user.username,
  };

  // Sign the token with a secret key and set an expiration time
  return jwt.sign(payload, "mySecretKey", { expiresIn: "1h" });
}
// API route handler
export async function POST(request: Request) {
  const { username, password: claimedCorrectPassword } =
    (await request.json()) as LoginFormDataType;

  // Find the user by username
  const user = userData.users.find(
    (u: LoginFormDataType) => u.username === username
  );

  // Check if the user exists and the password is correct
  if (user && user.password === claimedCorrectPassword) {
    // Generate a JWT with user information
    const token = generateToken({ ...user, id: userData.users.length + 1 });

    return NextResponse.json(
      { message: "Login successful", token },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }
}
```

The snippet above is the logic in login route handler, upon receiving login credentials, it checks if the user exists and if the provided password is correct. If so, it generates a JWT containing user information and sends a success response; otherwise, it sends an error response. Additionally, make sure to store the secret key used to sign your token in a secure location, such as your environment variables.

And that is that about the route handlers.

Let us go ahead to the pages files.

<!-- /app/signup/page.tsx -->

```js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Signup successfull", data);
        router.push("/login");
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="form__container">
      <h2 className="">Sign Up</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Sign Up</button>
      </form>

      <Link href="/">Go to home page</Link>
    </div>
  );
};

export default SignUp;
```

This SignUp page code captures user input from the form, sends a POST request to `/api/signup`, and either redirects to the login page upon successful signup or logs any encountered errors.

<!-- /app/login/page.tsx -->

```jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const router = useRouter();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        // Redirecting
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="form__container">
      <h2 className="">Login</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Login </button>
      </form>

      <Link href="/">Go to home page</Link>
    </div>
  );
};

export default Login;
```

The logic in the Login Page is quite similar to the Signup page, but this time, we're redirecting to the dashboard.

Now, for an improvement in the `Login` component, we need to include the logic to store the token in the cookie. This way, we can fetch and utilize the token for future requests to the backend, just like in real-world situations. We'll also keep track of its expiration time to log the user out of our application (or routes that require authentication).

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Login successful:", data);

      // Logic to set cookie
      // Create a new Date object
      const date = new Date();

      // Calculate the expiration time in milliseconds
      date.setTime(date.getTime() + 60 * 60 * 1000);

      // Convert the date to UTC format and construct the 'expires' string
      const expires = "expires=" + date.toUTCString();

      document.cookie =
        "accessToken" + "=" + data.token + ";" + expires + ";path=/;HttpOnly";

      // Redirecting
      router.push("/dashboard");
    } else {
      const errorData = await response.json();
      console.error("Login failed:", errorData);
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
};
```

In the code above, the handleSubmit function has been updated with the storing of accessToken login. This section calculates the expiration time for the cookie in hours, and sets the cookie with the name "accessToken." The HttpOnly flag is added for security, preventing access to the cookie from client-side JavaScript.

I set the expiration time to one hour because that's what we did on the server too. They need to match each other for effective authorization and authentication.
