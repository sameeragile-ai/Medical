import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm
        role="admin"
        endpoint="/api/auth/admin"
        title="Admin sign in"
        subtitle="Enter the admin password to manage medicine inventory."
        fallbackPath="/admin"
      />
    </Suspense>
  );
}
