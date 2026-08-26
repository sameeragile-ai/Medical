import { redirect } from "next/navigation";

export default async function InquiryLoginPage({ searchParams }) {
  const params = await searchParams;
  const next = params?.next ? `?next=${encodeURIComponent(params.next)}` : "";
  redirect(`/admin/login${next}`);
}
