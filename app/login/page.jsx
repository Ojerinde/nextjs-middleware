"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const router = useRouter();

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
