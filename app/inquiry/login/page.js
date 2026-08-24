import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function InquiryLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm
        role="inquiry"
        endpoint="/api/auth/inquiry"
        title="Inquiry desk sign in"
        subtitle="Enter the sales team password to log patient inquiries."
        fallbackPath="/inquiry"
      />
    </Suspense>
  );
}
