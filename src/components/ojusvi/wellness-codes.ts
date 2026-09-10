import codeA from "@/assets/codes/A.webp";
import codeB from "@/assets/codes/B.webp";
import codeC from "@/assets/codes/C.webp";
import codeD from "@/assets/codes/D.webp";
import codeE from "@/assets/codes/E.webp";
import codeF from "@/assets/codes/F.webp";
import codeG from "@/assets/codes/G.webp";
import codeH from "@/assets/codes/H.webp";

export type Code = {
  letter: string;
  title: string;
  body: string;
  icon: string;
};

export const codes: Code[] = [
  { letter: "A", title: "Mobility & Breath", body: "For stiffness, flexibility, joint opening and breath awareness.", icon: codeA },
  { letter: "B", title: "BP & Stress Safe", body: "A calm, low-strain practice for relaxation and nervous system balance.", icon: codeB },
  { letter: "C", title: "Metabolic Health", body: "Focused on diabetes, cholesterol, fatty liver, obesity and abdominal weight.", icon: codeC },
  { letter: "D", title: "Joint & Back Pain", body: "Gentle practices for osteoarthritis, spine comfort and joint mobility.", icon: codeD },
  { letter: "E", title: "Thyroid & Energy", body: "Supports energy rhythm, fatigue management and gentle activation.", icon: codeE },
  { letter: "F", title: "Sleep & Anxiety Reset", body: "Slow, calming sessions for better sleep and nervous system recovery.", icon: codeF },
  { letter: "G", title: "Strength & Balance", body: "Builds posture, stability, balance and core strength.", icon: codeG },
  { letter: "H", title: "Gentle Recovery", body: "A conservative session for pain-sensitive or BP-sensitive days.", icon: codeH },
];
