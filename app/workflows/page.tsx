import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileSearch, Home, ShieldCheck, Workflow } from "lucide-react";
import { AlisShell } from "@/components/alis-shell";

const workflows = [
  {
    id: "ccma_dispute",
    title: "Employment & CCMA preparation",
    eyebrow: "WORKPLACE",
    description: "Organise the sequence of events, employment records, notices and questions to verify before seeking advice.",
    gathers: ["Employment or dismissal event", "Dates notices were issued and received", "Contract, payslips and correspondence"],
    icon: BriefcaseBusiness,
  },
  {
    id: "lease_dispute",
    title: "Lease & landlord notices",
    eyebrow: "PROPERTY",
    description: "Build a clear record of the lease, payments, communications, property issues and notices received.",
    gathers: ["Lease and addenda", "Payment and maintenance evidence", "Notice wording and receipt date"],
    icon: Home,
  },
  {
    id: "popia_incident",
    title: "Personal information incident",
    eyebrow: "DATA PROTECTION",
    description: "Capture what may have happened, which information may be involved and what evidence is still missing.",
    gathers: ["Discovery time and known events", "Information types and affected people", "System logs and containment steps"],
    icon: ShieldCheck,
  },
  {
    id: "general",
    title: "General situation mapping",
    eyebrow: "START ANYWHERE",
    description: "Start in plain language when you are unsure which legal process or documents may be relevant.",
    gathers: ["What happened and who was involved", "Important dates and amounts", "Documents or communications to locate"],
    icon: FileSearch,
  },
] as const;

export default function WorkflowsPage() {
  return (
    <AlisShell>
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b5b]">Guided intake</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Start with the situation, not legal jargon.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-black/55">Choose a guided workflow to help ALIS collect the right facts, organise the available evidence and show what still needs confirmation. These workflows prepare you for a legal consultation. They do not determine legal rights or outcomes.</p>
      </div>
      <div className="mt-9 grid gap-4 xl:grid-cols-2">
        {workflows.map(({ id, title, eyebrow, description, gathers, icon: Icon }) => (
          <article key={id} className="flex flex-col rounded-3xl border border-black/10 bg-white p-6 transition-shadow hover:shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#eef4f1] text-[#176b5b]"><Icon size={21} strokeWidth={1.8} /></div>
              <span className="rounded-full border border-black/10 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-black/45">{eyebrow}</span>
            </div>
            <h2 className="mt-6 text-xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-black/55">{description}</p>
            <div className="mt-5 border-t border-black/8 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">Useful information to gather</p>
              <ul className="mt-3 space-y-2">
                {gathers.map((item) => <li key={item} className="flex items-start gap-2 text-sm leading-5 text-black/70"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#176b5b]" />{item}</li>)}
              </ul>
            </div>
            <div className="mt-auto pt-7">
              <Link href={"/scanner?workflow=" + id} className="inline-flex w-full items-center justify-between rounded-xl bg-[#173d35] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#205248]">
                Start this workflow <ArrowRight size={17} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-black/60">
        <Workflow className="mt-0.5 shrink-0 text-[#176b5b]" size={19} />
        <p><strong className="text-[#15221f]">What happens next?</strong> ALIS creates a matter in your workspace, queues an analysis and returns a situation map with a timeline, source quotations where available, information gaps and practical preparation steps.</p>
      </div>
    </AlisShell>
  );
}
