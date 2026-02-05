export interface TermsSection {
  id: string;
  title: string;
  content: string[];
}

export const termsIntro: string[] = [
  "Welcome to Mailria. By accessing, purchasing, or using any Mailria service, you agree to be legally bound by these Terms of Service (\"Terms\"). If you do not agree with any part of these Terms, you must immediately discontinue use of Mailria.",
  "Mailria is not a traditional email provider. Use this service only if you fully understand and accept its limitations.",
];

export const termsData: TermsSection[] = [
  {
    id: "1",
    title: "About Mailria & Service Scope",
    content: [
      "Mailria is a purpose-built email platform designed for lightweight, temporary, and non-critical use, primarily for game-related accounts, anonymous sign-ups, and verification workflows. Mailria is not intended for long-term storage, personal communication, business correspondence, or sensitive data usage.",
      "Any use beyond this intended scope is done entirely at the user's own risk.",
    ],
  },
  {
    id: "2",
    title: "Acceptance & Modification of Terms",
    content: [
      "These Terms govern all access to and use of Mailria, including all related websites, systems, and services operated under the Mailria name.",
      "Mailria reserves the right to modify, update, or replace these Terms at any time without prior notice. Continued use of the service after changes are posted constitutes acceptance of the revised Terms.",
    ],
  },
  {
    id: "3",
    title: "Account Creation & Registration Policy",
    content: [
      "Mailria does not provide open public registration.",
      "All Mailria email accounts are:",
      "• Created manually by Mailria administrators, or",
      "• Issued through authorized vendors or resellers.",
      "Users must obtain Mailria email exclusively through official purchase channels or approved vendors.",
    ],
  },
  {
    id: "4",
    title: "Vendor-Based Accounts & Password Responsibility",
    content: [
      "If you obtained your Mailria email through a vendor or reseller:",
      "• All initial support, including password recovery, account access, and purchase verification, must be handled by that vendor.",
      "• Mailria does not guarantee password recovery under any circumstances.",
      "• Loss of access due to forgotten credentials is the user's responsibility.",
      "• Mailria is not liable for vendor errors, miscommunication, fraud, or failure to deliver services.",
    ],
  },
  {
    id: "5",
    title: "Intended Usage Restrictions",
    content: [
      "Users are strictly advised not to connect Mailria emails to:",
      "• Banking or financial services",
      "• Government or legal platforms",
      "• Private personal or business accounts",
      "• Any service where data loss may cause significant harm",
      "Mailria is optimized for temporary and disposable workflows.",
    ],
  },
  {
    id: "6",
    title: "Email Sending Limitations",
    content: [
      "To maintain platform stability and prevent abuse:",
      "• Outgoing email sending is limited to a maximum of 3 emails per account per day.",
      "• Mailria is not designed for bulk sending, campaigns, or ongoing communication.",
      "• Attempts to bypass or abuse sending limits may result in immediate suspension.",
    ],
  },
  {
    id: "7",
    title: "Email Storage & Automatic Deletion",
    content: [
      "Mailria does not offer long-term storage.",
      "• Emails older than 100 days are automatically and permanently deleted.",
      "• Deleted emails cannot be recovered under any circumstances.",
      "• Mailria does not maintain backups of user inboxes or content.",
    ],
  },
  {
    id: "8",
    title: "Security Practices & Administrative Access",
    content: [
      "Users are required to update their account passwords periodically to maintain security.",
      "For security, abuse prevention, or legal compliance purposes, Mailria administrators reserve the right to access inboxes, metadata, or account activity when deemed necessary.",
      "This access is limited to internal review and is not performed for commercial purposes.",
    ],
  },
  {
    id: "9",
    title: "Privacy & Data Handling",
    content: [
      "Mailria does not sell or monetize personal user data.",
      "However, due to the nature of the service:",
      "• Privacy is not guaranteed at the level of traditional email providers.",
      "• Users should assume all data stored is temporary and disposable.",
      "For additional information, refer to the Privacy Policy or contact support.",
    ],
  },
  {
    id: "10",
    title: "Service Disclaimer",
    content: [
      "Mailria is provided \"as is\" and \"as available\".",
      "Mailria makes no warranties, express or implied, regarding:",
      "• Service uptime or availability",
      "• Email delivery success or timing",
      "• Data accuracy, retention, or integrity",
      "Use of Mailria is entirely at the user's own risk.",
    ],
  },
  {
    id: "11",
    title: "Limitation of Liability",
    content: [
      "Mailria shall not be liable for:",
      "• Loss of emails or account access",
      "• Missed, delayed, or undelivered messages",
      "• Service interruptions or system failures",
      "• Any direct or indirect damages resulting from use or abuse of the service",
      "Users explicitly waive any claims against Mailria arising from these risks.",
    ],
  },
  {
    id: "12",
    title: "User Responsibility & Prohibited Activities",
    content: [
      "Users are fully responsible for all activity conducted using their Mailria email.",
      "Prohibited activities include, but are not limited to:",
      "• Spam, phishing, fraud, or illegal activity",
      "• Abuse of system limits or security mechanisms",
      "• Attempted unauthorized access or exploitation",
      "Violations may result in immediate suspension or deletion without notice.",
    ],
  },
  {
    id: "13",
    title: "Termination & Account Deletion",
    content: [
      "Mailria reserves the right to suspend or terminate any account at any time, for any reason, including but not limited to:",
      "• Abuse or suspicious behavior",
      "• Security or fraud risks",
      "• Policy violations",
      "• Inactivity exceeding 60 days",
      "Termination may occur without prior warning.",
    ],
  },
  {
    id: "14",
    title: "No Guarantee of Email Delivery",
    content: [
      "Mailria does not guarantee that any email sent or received will be delivered successfully or in a timely manner.",
      "Delivery failures, delays, filtering, or message loss may occur without notice.",
    ],
  },
  {
    id: "15",
    title: "Shared or Non-Exclusive Use",
    content: [
      "Some Mailria email accounts may be:",
      "• Shared",
      "• Reused",
      "• Issued on a non-exclusive basis",
      "Mailria does not guarantee exclusive ownership or permanent assignment of any email address unless explicitly stated in writing.",
    ],
  },
  {
    id: "16",
    title: "Intellectual Property & Ownership",
    content: [
      "Users do not own Mailria email addresses.",
      "All domain names, email addresses, systems, and infrastructure remain the exclusive property of Mailria. Use of the service grants no ownership or intellectual property rights.",
    ],
  },
  {
    id: "17",
    title: "Abuse Investigation & Law Enforcement Disclosure",
    content: [
      "Mailria reserves the right to investigate suspected abuse or illegal activity.",
      "If necessary, Mailria may disclose account data, email content, and metadata to law enforcement or relevant authorities without prior notice to the user.",
    ],
  },
  {
    id: "18",
    title: "Automation, Rate Limiting & Third-Party Services",
    content: [
      "Mailria may apply rate limiting, automation restrictions, or access controls to maintain service stability and prevent abuse.",
    ],
  },
];

export const termsEffectiveDate = "01/05/2026";
