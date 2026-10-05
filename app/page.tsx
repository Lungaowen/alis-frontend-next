"use client";

import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SecurityIcon from "@mui/icons-material/Security";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8f7]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <div className="text-2xl font-black">ALIS</div>
          <div className="text-xs text-black/45">Automated Legal Intelligence System</div>
        </div>
        <Link href="/dashboard" className="rounded-xl bg-[#173d35] px-5 py-3 text-sm font-semibold text-white">
          Enter ALIS
        </Link>
      </nav>
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <div className="max-w-3xl">
          <span className="rounded-full border bg-white px-4 py-2 text-xs font-semibold">
            South African Legal Tech
          </span>
          <h1 className="mt-7 text-5xl font-bold leading-tight md:text-7xl">
            Assess risks. Prepare cases. Act with confidence.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/55">
            Analyze situations, organize evidence, and seamlessly prepare for professional legal counsel.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/scanner" className="inline-flex items-center gap-2 rounded-xl bg-[#173d35] px-5 py-3 font-semibold text-white">
              Start Analysis <ArrowForwardIcon fontSize="small" />
            </Link>
            <Link href="/dashboard" className="rounded-xl border bg-white px-5 py-3 font-semibold">
              View Workspace
            </Link>
          </div>
        </div>
        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            [PhotoCameraIcon, "Document Scanning", "Extract text from physical documents."],
            [AutoAwesomeIcon, "Legal Analysis", "Identify core issues and required steps."],
            [SecurityIcon, "Case Preparation", "Structure evidence for legal counsel."]
          ].map(([Icon, title, text]) => (
            <div key={title as string} className="rounded-3xl border bg-white p-6">
              {/* @ts-ignore */}
              <Icon sx={{ color: "#173d35" }} />
              <h2 className="mt-8 text-xl font-bold">{title as string}</h2>
              <p className="mt-2 text-sm text-black/55">{text as string}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
