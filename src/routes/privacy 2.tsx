import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, H2, H3, P, UL } from "@/components/ojusvi/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Ojusvi" },
      { name: "description", content: "How Ojusvi Goodhealth Private Limited collects, uses, and protects your personal data under the DPDP Act, 2023." },
      { property: "og:title", content: "Privacy Policy — Ojusvi" },
      { property: "og:description", content: "How Ojusvi collects, uses, and protects your personal data under the DPDP Act, 2023." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy — Ojusvi" },
      { name: "twitter:description", content: "How Ojusvi collects, uses, and protects your personal data under the DPDP Act, 2023." },
    ],
    links: [{ rel: "canonical", href: "https://ojusvi.app/privacy" }],
  }),
  component: PrivacyPage,
});


function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="April 2026">
      <H2>1. Introduction</H2>
      <P>This Privacy Policy (<strong>Policy</strong>) describes how <strong>Ojusvi Goodhealth Private Limited</strong> ("Company", "we", "us", "our"), having its registered office at <strong>Unitech Harmony, Sector 50, Gurgaon 122018, India</strong>, collects, uses, processes, and protects personal data of users ("User", "you", "your") who access or use our website (www.ojusvi.app) and mobile application (collectively, the "Platform").</P>
      <P>This Policy is issued in accordance with the <strong>Digital Personal Data Protection Act, 2023</strong> ("DPDP Act") and other applicable laws of India. By accessing or using the Platform, you acknowledge that you have read and understood this Policy and consent to the processing of your personal data in accordance with its terms.</P>

      <H2>2. Key Definitions</H2>
      <UL>
        <li><strong>"Personal Data"</strong> means any data about an individual who is identifiable by or in relation to such data.</li>
        <li><strong>"Processing"</strong> includes collection, storage, use, sharing, disclosure, or erasure of personal data.</li>
        <li><strong>"Data Principal"</strong> refers to the individual to whom the personal data relates.</li>
        <li><strong>"Data Fiduciary"</strong> refers to the Company, which determines the purpose and means of processing personal data.</li>
        <li><strong>"Consent Manager"</strong> refers to an entity registered under the DPDP Act that enables Data Principals to manage their consent.</li>
      </UL>

      <H2>3. Lawful Basis for Processing</H2>
      <H3>3.1 Consent</H3>
      <P>We process Personal Data based on your free, specific, informed, and unambiguous consent, obtained at the time of data collection.</P>
      <H3>3.2 Legitimate Uses (as permitted under DPDP Act)</H3>
      <P>We may process Personal Data without explicit consent where permitted under law, including:</P>
      <UL>
        <li>Compliance with legal obligations;</li>
        <li>Medical emergencies or health services;</li>
        <li>Employment-related purposes;</li>
        <li>Prevention of fraud or unlawful activity;</li>
        <li>Any other purpose permitted under the DPDP Act.</li>
      </UL>

      <H2>4. Categories of Personal Data Collected</H2>
      <H3>4.1 Identity and Contact Data</H3>
      <P>Name, phone number, email address, date of birth, gender, and address.</P>
      <H3>4.2 Health and Related Data</H3>
      <P>Health-related information, medical records, and wellness data voluntarily provided by you.</P>
      <H3>4.3 Financial and Transactional Data</H3>
      <P>Payment-related information (excluding card details), billing information, and transaction history.</P>
      <H3>4.4 Technical and Usage Data</H3>
      <P>IP address, device information, browser type, log data, and usage analytics.</P>
      <H3>4.5 Location Data</H3>
      <P>Approximate or precise location data, subject to your device permissions.</P>
      <H3>4.6 Non-Personal / Anonymized Data</H3>
      <P>Aggregated or anonymized data used for analytics and service improvement.</P>

      <H2>5. Purpose of Processing</H2>
      <UL>
        <li>To provide, operate, and improve the Platform and Services;</li>
        <li>To personalize user experience;</li>
        <li>To communicate with you regarding services, updates, and support;</li>
        <li>To process transactions and facilitate payments;</li>
        <li>To ensure platform security and prevent fraud;</li>
        <li>To comply with legal and regulatory obligations;</li>
        <li>To conduct analytics, research, and product development.</li>
      </UL>

      <H2>6. Notice to Data Principals</H2>
      <P>At or before the time of collecting your Personal Data, we provide a notice containing the categories of Personal Data being collected; the purpose of processing; the manner in which you may exercise your rights; and details of grievance redressal mechanisms.</P>

      <H2>7. Consent and Withdrawal</H2>
      <UL>
        <li>Consent is obtained through clear affirmative action (e.g., sign-up, acceptance).</li>
        <li>You may withdraw your consent at any time by contacting us at <strong>hello@ojusvi.app</strong> or through available Platform settings.</li>
      </UL>
      <P>Withdrawal of consent will not affect the lawfulness of processing already carried out but may limit your ability to use certain Services.</P>

      <H2>8. Sharing and Disclosure of Personal Data</H2>
      <P>We do <strong>not sell</strong> Personal Data. We may share your data only in the following cases:</P>
      <UL>
        <li><strong>Service Providers:</strong> With vendors and partners for service delivery, under strict contractual obligations;</li>
        <li><strong>Legal Compliance:</strong> When required by law, courts, or government authorities;</li>
        <li><strong>Business Transfers:</strong> In mergers, acquisitions, or restructuring;</li>
        <li><strong>Safety and Security:</strong> To prevent fraud, enforce rights, or ensure safety;</li>
        <li><strong>With Consent:</strong> Where explicitly permitted by you.</li>
      </UL>

      <H2>9. Cross-Border Data Transfers</H2>
      <P>Personal Data may be transferred outside India only to jurisdictions permitted by the Government of India under the DPDP Act. We ensure that such transfers are subject to appropriate safeguards.</P>

      <H2>10. Data Retention</H2>
      <P>We retain Personal Data only for as long as necessary to fulfill the purposes outlined in this Policy, comply with legal obligations, and resolve disputes and enforce agreements. Data is deleted or anonymized once it is no longer required, unless retention is mandated by law.</P>

      <H2>11. Data Security Safeguards</H2>
      <P>We implement reasonable security safeguards, including encryption and secure infrastructure, access controls and authentication, and regular monitoring and risk assessments. In the event of a personal data breach, we will notify the Data Protection Board of India and affected Data Principals as required under the DPDP Act.</P>

      <H2>12. Rights of Data Principals</H2>
      <UL>
        <li>Right to Access Information about your Personal Data;</li>
        <li>Right to Correction and Erasure of inaccurate or outdated data;</li>
        <li>Right to Withdraw Consent at any time;</li>
        <li>Right to Grievance Redressal;</li>
        <li>Right to Nominate another individual to exercise rights in case of death or incapacity.</li>
      </UL>
      <P>Requests can be submitted to <strong>hello@ojusvi.app</strong>.</P>

      <H2>13. Duties of Data Principals</H2>
      <UL>
        <li>Provide authentic and accurate information;</li>
        <li>Not impersonate others or provide false data;</li>
        <li>Comply with applicable laws while using the Platform.</li>
      </UL>

      <H2>14. Children's Data</H2>
      <P>We do not knowingly collect Personal Data of individuals below 18 years of age. Where processing involves minors, we will obtain verifiable consent from a parent or lawful guardian, as required under the DPDP Act.</P>

      <H2>15. Cookies and Tracking Technologies</H2>
      <P>We use cookies and similar technologies to enhance user experience, analyze usage patterns, and improve Platform performance. You may manage cookie preferences through your browser settings or our in-app consent banner.</P>

      <H2>16. Third-Party Links</H2>
      <P>The Platform may contain links to third-party websites. We are not responsible for their privacy practices. Users are advised to review their policies independently.</P>

      <H2>17. Grievance Redressal</H2>
      <P><strong>Grievance Officer:</strong> Akanksha Jain<br /><strong>Email:</strong> hello@ojusvi.app</P>
      <P>We will address grievances within the timelines prescribed under applicable law.</P>

      <H2>18. Updates to this Policy</H2>
      <P>We may update this Policy from time to time. Updated versions will be published on the Platform with a revised effective date. Continued use of the Platform constitutes acceptance of the updated Policy.</P>

      <H2>19. Governing Law and Jurisdiction</H2>
      <P>This Policy shall be governed by the laws of India.</P>

      <H2>20. Acceptance</H2>
      <P>By accessing or using the Platform, you confirm that you have read, understood, and agreed to this Privacy Policy.</P>
    </LegalLayout>
  );
}