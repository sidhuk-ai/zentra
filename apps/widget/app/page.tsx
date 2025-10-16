"use client";

import { Suspense } from "react";
import { ChatbotWidget } from "@/modules/widgets/ui/widget-view";
import { useSearchParams } from "next/navigation";

function ChatbotPageContent() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId") || "";

  return (
    <div className="flex items-center justify-center min-h-svh">
      <ChatbotWidget organizationId={organizationId} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading widget...</div>}>
      <ChatbotPageContent />
    </Suspense>
  );
}
