export interface PrivacySection {
  id: string;
  title: string;
  content: string[];
}

export const privacyIntro: string[] = [
  "This Privacy Policy explains how Mailria collects, uses, stores, protects, and discloses information when you access and use our service.",
  "By accessing, purchasing, or using Mailria, you acknowledge that you have read, understood, and agreed to this Privacy Policy. If you do not agree, you must not use the service.",
  "Mailria is not a traditional email provider. Privacy expectations must be aligned with its limited, temporary, and disposable nature of the service.",
];

export const privacyData: PrivacySection[] = [
  {
    id: "1",
    title: "Service Nature & Privacy Expectations",
    content: [
      "Mailria is a lightweight email service designed to provide temporary email addresses used primarily for:",
      "• Account registration",
      "• Verification codes",
      "• Temporary access purposes",
      "Mailria is not intended for:",
      "• Long-term personal communication",
      "• Business correspondence",
      "• Storage of sensitive or private data",
      "Users should assume all data stored in Mailria is temporary and disposable.",
    ],
  },
  {
    id: "2",
    title: "Information We Collect",
    content: [
      "Mailria may collect and process the following categories of information:",
      "a. Email Metadata (Including IP Addresses, Email Headers, Timestamps, Sender and Recipient IDs)",
      "• For operational monitoring, delivery, and abuse prevention",
      "b. Account Activity Data (Login Time, Session Tokens, Device Information)",
      "• Used to maintain security and prevent unauthorized use",
      "c. Support Communications",
      "• If you contact Mailria support, we may store your message content and any relevant identifiers for problem resolution.",
      "Mailria does not require users to submit personal names, addresses, or government-issued identification.",
    ],
  },
  {
    id: "3",
    title: "Purpose of Data Processing",
    content: [
      "Collected information is used strictly to:",
      "• Operate, maintain, and secure the Mailria platform",
      "• Deliver, forward, and manage emails securely",
      "• Monitor system performance and service stability",
      "• Support law enforcement requests when legally required",
      "• Prevent abuse, spam, or malicious activity",
      "Mailria does not sell user data or perform marketing-related tracking.",
    ],
  },
  {
    id: "4",
    title: "Email Content & Temporary Storage",
    content: [
      "Mailria emails are stored temporarily and automatically deleted after a set period.",
      "• Mailria does not maintain backups of email content",
      "• Deleted emails cannot be recovered under any circumstances",
      "• User generated emails cannot be transferred or exported outside the service unless necessary for service purposes",
      "Email content and metadata may be processed by automated filtering systems to detect abuse or spam.",
    ],
  },
  {
    id: "5",
    title: "Administrative Access to Data",
    content: [
      "Mailria administrators may access inbox content, metadata, or email communication only when necessary for:",
      "• Security audits",
      "• Abuse or fraud investigations",
      "• Compliance with legal requirements",
      "Administrative access is limited, logged, and restricted, and never performed for commercial purposes.",
    ],
  },
  {
    id: "6",
    title: "Third-Party Infrastructure & Data Processing",
    content: [
      "Mailria may rely on third-party providers for hosting, email routing, storage, and security services.",
      "As a result:",
      "• Data may be processed or stored in multiple jurisdictions",
      "• Email delivery may be subject to third-party policies or service interruptions",
      "• Mailria is not responsible for third-party misuse beyond its control",
      "Use of Mailria implies acceptance of these limitations.",
    ],
  },
  {
    id: "7",
    title: "Data Sharing & Disclosure",
    content: [
      "Mailria does not sell or rent user data.",
      "Information may be disclosed only under these cases:",
      "• Authorized service providers, where applicable",
      "• Law enforcement or governmental authorities, if legally required",
      "• Protection against fraud, abuse, or malicious activities",
      "• Third-party service providers strictly for service operation and security purposes",
      "All disclosures are made in accordance with applicable law.",
    ],
  },
  {
    id: "8",
    title: "Data Retention Policy",
    content: [
      "Mailria retains email content only for limited periods:",
      "• Inbox content is automatically deleted after 30 days",
      "• Account inactivity may result in deletion after 90 days",
      "• System logs and metadata may be retained longer for security and compliance",
      "Mailria may delete inactive inboxes without notice.",
    ],
  },
  {
    id: "9",
    title: "Security Measures",
    content: [
      "Mailria implements reasonable security safeguards, including:",
      "• Password hashing",
      "• Rate limiting and abuse detection",
      "• IP blocking and automated security rules",
      "However, Mailria is not a high-security or encrypted communication service, and users must not store sensitive, confidential, or high-risk information.",
    ],
  },
  {
    id: "10",
    title: "User Responsibility",
    content: [
      "Users are solely responsible for:",
      "• Maintaining confidentiality of account credentials",
      "• Using Mailria only for lawful purposes",
      "• Not using Mailria for banking, government, or private communications",
      "Users are encouraged to update passwords periodically and avoid misuse.",
      "Use of Mailria is entirely at the user's own risk.",
    ],
  },
  {
    id: "11",
    title: "No User Rights to Data Export or Deletion Requests",
    content: [
      "Due to its disposable nature of the service:",
      "• Mailria does not support data export features",
      "• Users do not possess manual deletion rights beyond system cleanup policies",
      "• Access to emails is temporary and not guaranteed",
    ],
  },
  {
    id: "12",
    title: "Shared or Non-Exclusive Accounts",
    content: [
      "Mailria accounts may be reused, shared, or not permanently assigned.",
      "Mailria does not guarantee exclusive control over any email address.",
    ],
  },
  {
    id: "13",
    title: "Legal Compliance & Investigations",
    content: [
      "Mailria reserves the right to investigate suspected abuse or illegal activity.",
      "Disclosure may occur without prior notice when required by law.",
    ],
  },
  {
    id: "14",
    title: "No Absolute Privacy Guarantee",
    content: [
      "While Mailria takes reasonable steps to minimize privacy risks, complete privacy cannot be guaranteed due to:",
      "• Technical limitations",
      "• Temporary infrastructure",
      "• Potential abuse monitoring",
      "• Legal obligations",
      "Use of the service is at your own risk.",
    ],
  },
  {
    id: "15",
    title: "Policy Changes",
    content: [
      "Mailria may update this Privacy Policy at any time.",
      "Users are responsible for reviewing updates.",
      "Continued use of Mailria constitutes acceptance of the revised policy.",
    ],
  },
  {
    id: "16",
    title: "Relationship to Terms of Service",
    content: [
      "This Privacy Policy is an integral part of the Mailria Terms of Service.",
      "In the event of any conflict, the Terms of Service shall prevail.",
    ],
  },
  {
    id: "17",
    title: "Contact Information",
    content: [
      "For official privacy-related inquiries only, contact:",
      "• Email: support@mailria.com",
    ],
  },
];

export const privacyEffectiveDate = "January 11, 2024";
