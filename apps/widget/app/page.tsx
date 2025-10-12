"use client";

import { ChatbotWidget } from "@/modules/widgets/ui/widget-view";
import { useSearchParams } from "next/navigation";


export default function Page() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId") || "";
  return (
    <div className="flex items-center justify-center min-h-svh">
      <ChatbotWidget organizationId={organizationId} />
    </div>
  )
}
