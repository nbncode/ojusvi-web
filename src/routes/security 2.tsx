import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, H2, P, UL } from "@/components/ojusvi/LegalLayout";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Information Security Policy — Ojusvi" },
      { name: "description", content: "Measures Ojusvi adopts to protect information assets and ensure data security." },
      { property: "og:title", content: "Information Security Policy — Ojusvi" },
      { property: "og:description", content: "Measures Ojusvi adopts to protect information assets and ensure data security." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Information Security Policy — Ojusvi" },
      { name: "twitter:description", content: "Measures Ojusvi adopts to protect information assets and ensure data security." },
    ],
    links: [{ rel: "canonical", href: "https://ojusvi.app/security" }],
  }),
  component: SecurityPage,
});


function SecurityPage() {
  return (
    <LegalLayout title="Information Security Policy" updated="April 2026">
      <H2>1. Purpose</H2>
      <P>This Policy outlines the measures adopted by <strong>Ojusvi Goodhealth Private Limited</strong> to protect information assets and ensure data security.</P>

      <H2>2. Scope</H2>
      <UL>
        <li>Employees, contractors, and vendors</li>
        <li>All systems, applications, and data handled by the Company</li>
      </UL>

      <H2>3. Security Principles</H2>
      <UL>
        <li><strong>Confidentiality:</strong> Access to data is restricted to authorized individuals.</li>
        <li><strong>Integrity:</strong> Data is protected from unauthorized alteration.</li>
        <li><strong>Availability:</strong> Systems are maintained to ensure reliable access.</li>
      </UL>

      <H2>4. Security Measures</H2>
      <UL>
        <li>Encryption of sensitive data</li>
        <li>Secure authentication and access controls</li>
        <li>Role-based access restrictions</li>
        <li>Regular security testing and audits</li>
      </UL>

      <H2>5. Incident Management</H2>
      <UL>
        <li>Security incidents are promptly identified, logged, and investigated.</li>
        <li>Data breaches are handled in accordance with applicable laws (including the DPDP Act, 2023).</li>
        <li>Appropriate corrective actions are taken.</li>
      </UL>

      <H2>6. Third-Party Security</H2>
      <UL>
        <li>Vendors are required to comply with contractual data protection and confidentiality obligations.</li>
        <li>Data sharing is limited to what is necessary for service delivery.</li>
      </UL>

      <H2>7. Employee Responsibility</H2>
      <UL>
        <li>Maintain confidentiality of data</li>
        <li>Follow internal security practices</li>
        <li>Report any security concerns immediately</li>
      </UL>

      <H2>8. Continuous Improvement</H2>
      <P>Security practices are regularly reviewed and updated based on evolving risks and regulatory requirements.</P>
    </LegalLayout>
  );
}