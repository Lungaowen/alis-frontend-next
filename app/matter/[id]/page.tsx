"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { AlisShell } from "@/components/alis-shell";

export default function MatterRedirectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const matterId = String(params.id || "");

  useEffect(() => {
    if (matterId) router.replace("/matters/" + encodeURIComponent(matterId) + "/triage");
  }, [matterId, router]);

  return <AlisShell><div className="mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/55"><LoaderCircle size={18} className="animate-spin text-[#176b5b]" />Opening your saved matter…</div></AlisShell>;
}
