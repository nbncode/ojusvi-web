import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, H2, H3, P, UL } from "@/components/ojusvi/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Ojusvi" },
      { name: "description", content: "The terms governing your access to and use of the Ojusvi platform and services." },
      { property: "og:title", content: "Terms & Conditions — Ojusvi" },
      { property: "og:description", content: "The terms governing your access to and use of the Ojusvi platform and services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Terms & Conditions — Ojusvi" },
      { name: "twitter:description", content: "The terms governing your access to and use of the Ojusvi platform and services." },
    ],
    links: [{ rel: "canonical", href: "https://ojusvi.app/terms" }],
  }),
  component: TermsPage,
});


function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" updated="April 2026">
      <H2>1. Introduction</H2>
      <P>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", "your") and <strong>Ojusvi Goodhealth Private Limited</strong>, a company incorporated under the Companies Act, 2013, having its registered office at <strong>Unitech Harmony, Sector 50, Gurgaon 122018, India</strong> ("Company", "we", "us", "our").</P>
      <P>These Terms govern your access to and use of our website and mobile application (collectively, the "Platform") and all services made available through the Platform ("Services"). By accessing or using the Platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use the Platform.</P>

      <H2>2. Scope of Services</H2>
      <UL>
        <li>Fitness Exercises</li>
        <li>Concierge and assistance services</li>
        <li>Events, workshops, and engagement activities</li>
        <li>Loyalty programs, rewards, and offers</li>
        <li>Curated products and services</li>
        <li>Travel-related services</li>
        <li>Employment and earning opportunities</li>
      </UL>
      <P>Certain Services may be provided directly by the Company or through third-party service providers.</P>

      <H2>3. User Categories</H2>
      <H3>3.1 General Users</H3>
      <P>Users may browse the Platform without registration. Limited features may be accessible without creating an account.</P>
      <H3>3.2 Registered Users / Subscribers</H3>
      <P>Registered users who create an account and, where applicable, subscribe to paid offerings ("Subscribers") may access additional Services, including premium features, events, and assistance services.</P>

      <H2>4. Eligibility</H2>
      <P>By using the Platform, you represent and warrant that:</P>
      <UL>
        <li>You are a natural person capable of entering into a legally binding agreement under applicable law;</li>
        <li>You are either at least 50 years of age, or a relative/caregiver of an individual aged 50 years or above;</li>
        <li>You are not prohibited by law from using the Services;</li>
        <li>All information provided by you is true, accurate, and complete.</li>
      </UL>

      <H2>5. Account Registration and Security</H2>
      <UL>
        <li>Maintain the confidentiality of your login credentials;</li>
        <li>Be responsible for all activities under your account;</li>
        <li>Notify us immediately of any unauthorized access or breach.</li>
      </UL>

      <H2>6. User Information and Consent</H2>
      <P>You may be required to provide personal and identification information (including KYC details) to access certain Services. By providing such information, you consent to its collection, storage, and processing; authorize the Company to share such information with affiliates, partners, and service providers for the purpose of delivering Services; and represent that all information provided is accurate and lawful.</P>

      <H2>7. User Conduct and Obligations</H2>
      <P>You agree not to:</P>
      <UL>
        <li>Violate any applicable laws or regulations;</li>
        <li>Provide false or misleading information;</li>
        <li>Impersonate any person or entity;</li>
        <li>Engage in fraudulent, abusive, or harmful conduct;</li>
        <li>Upload or transmit unlawful, defamatory, obscene, or infringing content;</li>
        <li>Interfere with the Platform's functionality, security, or integrity;</li>
        <li>Use automated systems (bots, scrapers) to access the Platform;</li>
        <li>Attempt to reverse engineer or compromise the Platform.</li>
      </UL>

      <H2>8. User Content</H2>
      <P>By participating in activities or submitting content on the Platform, you grant the Company a non-exclusive, royalty-free, worldwide, perpetual license to use, reproduce, modify, and distribute such content for business purposes. You are solely responsible for the content you share.</P>

      <H2>9. Fees and Payments</H2>
      <UL>
        <li>You agree to pay all applicable charges;</li>
        <li>All payments are final and non-refundable unless otherwise stated;</li>
        <li>Payment processing may be handled by third-party providers.</li>
      </UL>
      <P>The Company does not store sensitive payment information such as card details.</P>

      <H2>10. Third-Party Services</H2>
      <P>The Platform may include services, links, or integrations provided by third parties. The Company does not control or endorse such third parties and shall not be liable for third-party services or actions.</P>

      <H2>11. Suspension and Termination</H2>
      <P>The Company reserves the right to suspend, restrict, or terminate your access to the Platform or Services at its sole discretion, including in cases of breach of these Terms, suspected fraud, inaccurate information, security concerns, or compliance with legal requirements.</P>

      <H2>12. Assumption of Risk — Physical Activities</H2>
      <P>The Platform offers yoga, breathwork, movement, exercise routines, and other wellness practices ("Activities"). You acknowledge and agree that participation in any such Activity is entirely voluntary and undertaken at your sole risk.</P>
      <P>By accessing or participating in any Activity made available through the Platform, you represent, warrant, and agree that:</P>
      <UL>
        <li>You are medically fit and have no physical, mental, or health condition that would make participation unsafe;</li>
        <li>You have consulted, or will consult, a qualified physician or medical professional before beginning any Activity, particularly if you have any pre-existing condition, injury, are pregnant, or are recovering from illness or surgery;</li>
        <li>You will perform every Activity within your own physical limits, modify or discontinue any practice that causes discomfort, and seek immediate medical attention if needed;</li>
        <li>You assume full and sole responsibility for any and all risks of injury, pain, strain, soreness, aggravation of existing conditions, illness, disability, or any other adverse physical, mental, or emotional outcome arising out of or related to your participation in the Activities.</li>
      </UL>
      <P>The content available on the Platform is provided for general wellness and informational purposes only and does not constitute medical advice, diagnosis, or treatment. Instructors, teachers, and presenters featured on the Platform are not acting as your personal physician or healthcare provider.</P>
      <P>The Company, its affiliates, directors, officers, employees, instructors, and partners shall not be liable for any injury, pain, harm, loss, or damage of any nature whatsoever — whether physical, mental, emotional, direct, indirect, incidental, or consequential — suffered by you or any third party as a result of, or in connection with, your participation in any Activity offered through or accessed via the Platform. You hereby waive, release, and forever discharge the Company, its affiliates, directors, officers, employees, instructors, and partners from any and all claims, demands, or causes of action relating to such Activities.</P>

      <H2>13. Disclaimer of Warranties</H2>
      <P>The Platform and Services are provided on an "as is" and "as available" basis. To the maximum extent permitted by law, the Company disclaims all warranties, including fitness for a particular purpose, accuracy of content, uninterrupted operation, and security.</P>

      <H2>14. Limitation of Liability</H2>
      <UL>
        <li>The Company shall not be liable for indirect, incidental, consequential, or punitive damages;</li>
        <li>Total liability shall not exceed the amount paid by you (if any) for the relevant Service;</li>
        <li>The Company is not responsible for losses caused by third parties or external factors.</li>
      </UL>

      <H2>15. Indemnity</H2>
      <P>You agree to indemnify and hold harmless the Company, its affiliates, and representatives from any claims, losses, or liabilities arising from your use or misuse of the Platform, breach of these Terms, or violation of applicable laws or third-party rights.</P>

      <H2>16. Intellectual Property</H2>
      <P>All content, trademarks, logos, and materials on the Platform are owned by the Company or its licensors. You are granted a limited, non-exclusive, non-transferable license to use the Platform for personal, non-commercial purposes only.</P>

      <H2>17. Force Majeure</H2>
      <P>The Company shall not be liable for any failure or delay in performance due to events beyond its reasonable control, including natural disasters, network failures, or government actions.</P>

      <H2>18. Governing Law and Dispute Resolution</H2>
      <P>These Terms shall be governed by the laws of India. Disputes shall first be resolved through good faith negotiations; failing which, referred to arbitration under the Arbitration and Conciliation Act, 1996. Seat and venue of arbitration shall be <strong>Gurugram, India</strong>. Courts in Gurugram shall have exclusive jurisdiction, subject to arbitration.</P>

      <H2>19. Communications</H2>
      <P>By using the Platform, you consent to receive communications electronically via email, SMS, or in-app notifications. Such communications shall be deemed legally valid.</P>

      <H2>20. Modifications</H2>
      <P>The Company reserves the right to modify these Terms at any time. Updated Terms will be posted on the Platform. Continued use of the Platform constitutes acceptance of the revised Terms.</P>

      <H2>21. Contact Information</H2>
      <P><strong>Email:</strong> hello@ojusvi.app</P>

      <H2>22. Entire Agreement</H2>
      <P>These Terms, along with the Privacy Policy and any additional terms, constitute the entire agreement between you and the Company and supersede all prior agreements.</P>
    </LegalLayout>
  );
}
