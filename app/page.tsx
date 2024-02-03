import Link from "next/link";

export default function Home() {
  return (
    <main className="main__container">
      <h1>Welcome</h1>
      <div>
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign Up</Link>
      </div>
    </main>
  );
}
