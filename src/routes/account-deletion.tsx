import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, H2, P, UL } from "@/components/ojusvi/LegalLayout";

export const Route = createFileRoute("/account-deletion")({
  head: () => ({
    meta: [
      { title: "Account & Data Deletion — Ojusvi" },
      { name: "description", content: "How to request deletion of your Ojusvi account and how we manage such requests." },
      { property: "og:title", content: "Account & Data Deletion — Ojusvi" },
      { property: "og:description", content: "How to request deletion of your Ojusvi account and how we manage such requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Account & Data Deletion — Ojusvi" },
      { name: "twitter:description", content: "How to request deletion of your Ojusvi account and how we manage such requests." },
    ],
    links: [{ rel: "canonical", href: "https://ojusvi.app/account-deletion" }],
  }),
  component: AccountDeletionPage,
});


function AccountDeletionPage() {
  return (
    <LegalLayout title="Account & Data Deletion Policy" updated="April 2026">
      <H2>1. Introduction</H2>
      <P>This Policy explains how users may request deletion of their account and how <strong>Ojusvi Goodhealth Private Limited</strong> manages such requests.</P>

      <H2>2. Account Deletion Request</H2>
      <UL>
        <li>Emailing <strong>hello@ojusvi.app</strong></li>
        <li>Using in-app account settings (where available)</li>
      </UL>

      <H2>3. Effect of Deletion</H2>
      <UL>
        <li>Your account will be permanently deactivated.</li>
        <li>Access to Services will cease.</li>
        <li>Personal data will be deleted or anonymized, subject to legal requirements.</li>
      </UL>

      <H2>4. Data Retention</H2>
      <UL>
        <li>To comply with legal and regulatory obligations</li>
        <li>For fraud prevention or dispute resolution</li>
        <li>In anonymized or aggregated form for analytics</li>
      </UL>

      <H2>5. Processing Timeline</H2>
      <P>Deletion requests are typically processed within <strong>30 days</strong>, subject to verification. Residual data may remain in backup systems for a limited period.</P>

      <H2>6. Withdrawal of Consent</H2>
      <P>Users may withdraw consent for data processing at any time. This may limit access to certain Services.</P>

      <H2>7. Exceptions</H2>
      <UL>
        <li>By law or regulatory authorities</li>
        <li>For legitimate business purposes such as security and compliance</li>
      </UL>

      <H2>8. Contact</H2>
      <P>For deletion-related requests: <strong>hello@ojusvi.app</strong></P>
    </LegalLayout>
  );
}