import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#101C2C] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white/5 border border-[#0F766E]/30 rounded-2xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#4DD0C7] mb-4">
          Privacy Policy & POPIA Compliance Statement
        </h1>
        <p className="text-sm text-[#A7B0BA] mb-8">
          Last Updated: November 2026 | Platform: ALIS (Automated Legal Intelligence System) | Regulatory Framework: Protection of Personal Information Act, No. 4 of 2013 (POPIA)
        </p>

        <div className="space-y-6 text-gray-200 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-2">1. Commitment to Privacy</h2>
            <p>
              ALIS respects your constitutional right to privacy and is fully committed to complying with the Protection of Personal Information Act (POPIA). This Privacy Policy outlines how we collect, process, store, and secure your personal and legal document data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">2. Collection of Personal Information</h2>
            <p className="mb-2">In operating our hyperlocal LegalTech and document intelligence workflows, we may collect:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#A7B0BA]">
              <li>Contact details (Full name, email address, phone number).</li>
              <li>Uploaded legal documents, contracts, case briefs, and evidence logs submitted for automated analysis.</li>
              <li>Technical telemetry data, IP addresses, and device identifiers required for secure session authentication.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">3. Purpose of Processing (POPIA Section 13)</h2>
            <p className="mb-2">Personal and document information is processed strictly for:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#A7B0BA]">
              <li>Providing automated document intelligence, summarization, and case preparation features.</li>
              <li>Facilitating secure consultations and communication.</li>
              <li>Complying with statutory obligations under South African law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">4. Data Security & Confidentiality</h2>
            <ul className="list-disc pl-5 space-y-2 text-[#A7B0BA]">
              <li><strong>Encryption:</strong> All data in transit is secured via TLS 1.3 encryption, and data at rest is encrypted using AES-256 standards.</li>
              <li><strong>Access Control:</strong> Strict role-based access control (RBAC) ensures that only authorized system processes and the account holder can inspect sensitive legal file payloads.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">5. Data Subject Rights (POPIA Section 5)</h2>
            <p className="mb-2">Under POPIA, you retain the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#A7B0BA]">
              <li>Request access to your personal information held by ALIS.</li>
              <li>Request correction, destruction, or deletion of your personal records.</li>
              <li>Object to the processing of your personal information by contacting our Information Officer.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
