import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, H2, P, UL } from "@/components/ojusvi/LegalLayout";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Cancellation & Refund Policy — Ojusvi" },
      { name: "description", content: "Cancellation and refund terms for services and products offered by Ojusvi." },
      { property: "og:title", content: "Cancellation & Refund Policy — Ojusvi" },
      { property: "og:description", content: "Cancellation and refund terms for services and products offered by Ojusvi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Cancellation & Refund Policy — Ojusvi" },
      { name: "twitter:description", content: "Cancellation and refund terms for services and products offered by Ojusvi." },
    ],
    links: [{ rel: "canonical", href: "https://ojusvi.app/refund" }],
  }),
  component: RefundPage,
});


function RefundPage() {
  return (
    <LegalLayout title="Cancellation & Refund Policy" updated="April 2026">
      <H2>1. Introduction</H2>
      <P>This Cancellation &amp; Refund Policy ("Policy") governs cancellations and refunds for services and products offered by Ojusvi Goodhealth Private Limited ("Company") through its Platform. By using our Services, you agree to this Policy.</P>

      <H2>2. Subscription Services</H2>
      <UL>
        <li><strong>Monthly plan (₹349/month):</strong> You can cancel anytime from your UPI or bank app. Access continues until the end of the paid month; no refund is issued for the unused portion of that month.</li>
        <li><strong>Annual plan (₹2,988 for 12 months):</strong> Billed once, upfront. The annual fee is <strong>non-refundable</strong> for unused months if you choose to leave early, except where required by applicable law or where we fail to provide the service.</li>
        <li>Auto-renewal for the monthly plan can be turned off at any time from your UPI or bank app.</li>
      </UL>

      <H2>3. Service-Based Cancellation</H2>
      <UL>
        <li><strong>Before confirmation:</strong> Full refund, if payment has been made.</li>
        <li><strong>After confirmation but before service delivery:</strong> Refunds may be issued subject to vendor/partner terms.</li>
        <li><strong>After service delivery:</strong> No refunds will be provided.</li>
      </UL>

      <H2>4. Events and Workshops</H2>
      <UL>
        <li><strong>Free events:</strong> May be cancelled at any time.</li>
        <li><strong>Paid events — cancellation more than 24 hours in advance:</strong> Eligible for refund or credit.</li>
        <li><strong>Paid events — cancellation within 24 hours:</strong> No refund.</li>
      </UL>

      <H2>5. Third-Party Services</H2>
      <P>Certain Services are delivered by third-party partners. Refunds for such services will be subject to the respective partner's policies. The Company is not responsible for delays or denial of refunds by such partners.</P>

      <H2>6. Failed Transactions</H2>
      <P>In case of failed transactions where payment is deducted but service is not delivered, refunds will be processed within <strong>5–10 business days</strong>.</P>

      <H2>7. Exceptional Cases</H2>
      <P>The Company may, at its sole discretion, provide refunds in exceptional circumstances such as technical errors or duplicate payments.</P>

      <H2>8. Contact</H2>
      <P>For cancellation or refund queries: <strong>hello@ojusvi.app</strong></P>
    </LegalLayout>
  );
}