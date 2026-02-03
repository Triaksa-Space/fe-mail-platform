export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order?: number;
}

export interface FaqCategory {
  key: string;
  title: string;
  items: FaqItem[];
}

export const faqData: FaqCategory[] = [
  {
    key: "general",
    title: "General & Introduction",
    items: [
      {
        id: "general-1",
        question: "What is Mailria and what is its primary function?",
        answer: "Mailria is a purpose-built email platform designed for lightweight, temporary, and non-critical use, primarily for game-related accounts, anonymous sign-ups, and verification workflows. Mailria is not intended for long-term storage, personal communication, business correspondence, or sensitive data usage.",
        category: "general",
        order: 1,
      },
      {
        id: "general-2",
        question: "Is Mailria safe for accounts verification?",
        answer: "Mailria serves solely as the email recipient for verification codes and account management. While our platform is secure, the safety of your account ultimately depends on your own security practices (such as password management and 2FA). We guarantee the delivery of your emails, but account management on third-party is the user's responsibility.",
        category: "general",
        order: 2,
      },
      {
        id: "general-3",
        question: "Can Mailria be used for social media platforms?",
        answer: "Yes, Mailria can be used to receive verification emails from social media platforms. However, please note that some platforms may block or restrict emails from certain domains. We recommend testing with a specific platform before fully relying on Mailria for that service.",
        category: "general",
        order: 3,
      },
      {
        id: "general-4",
        question: "Does a Mailria account have an expiration date?",
        answer: "Mailria accounts may be terminated due to inactivity exceeding 60 days, abuse or suspicious behavior, security risks, or policy violations. Termination may occur without prior warning.",
        category: "general",
        order: 4,
      },
      {
        id: "general-5",
        question: "Does Mailria support verification for all platforms?",
        answer: "While Mailria works with most platforms, we cannot guarantee compatibility with every service. Some platforms may block disposable or temporary email domains. We recommend testing before committing to use Mailria for critical verifications.",
        category: "general",
        order: 5,
      },
    ],
  },
  {
    key: "registration",
    title: "Registration & Acquisition",
    items: [
      {
        id: "registration-1",
        question: "How do I register for a Mailria account?",
        answer: "Mailria does not provide open public registration. All Mailria email accounts are created manually by Mailria administrators or issued through authorized vendors or resellers. Users must obtain Mailria emails exclusively through official purchase channels or approved vendors.",
        category: "registration",
        order: 1,
      },
      {
        id: "registration-2",
        question: "How much does a Mailria account cost?",
        answer: "Pricing is determined by individual authorized vendors. We recommend checking the current market rates and competitive offers directly at https://gamemarket.gg/market/mailria",
        category: "registration",
        order: 2,
      },
      {
        id: "registration-3",
        question: "How can I ensure I am buying from a trusted vendor?",
        answer: "Only purchase from vendors listed on GameMarket.gg or other officially recognized marketplaces. Check vendor ratings, reviews, and transaction history before making a purchase. Avoid deals that seem too good to be true.",
        category: "registration",
        order: 3,
      },
      {
        id: "registration-4",
        question: "Can I purchase Mailria accounts in bulk?",
        answer: "Yes, bulk purchasing is possible depending on the vendor's stock. Please contact the vendors directly on GameMarket.gg to discuss bulk pricing or large-volume orders.",
        category: "registration",
        order: 4,
      },
    ],
  },
  {
    key: "account",
    title: "Account, Login, & Security",
    items: [
      {
        id: "account-1",
        question: "What should I do if I forget my password?",
        answer: "If you have set up a Binding Email, you can use the 'Forgot Password' feature on the login page to receive a reset code. If you don't have a Binding Email set up, you'll need to contact your vendor for assistance.",
        category: "account",
        order: 1,
      },
      {
        id: "account-2",
        question: "Can I change my Mailria password?",
        answer: "Yes, you can change your password from the Settings page after logging in. Go to Settings > Change Password, enter your current password and your new password to update it.",
        category: "account",
        order: 2,
      },
      {
        id: "account-3",
        question: "Can I log out from all devices remotely?",
        answer: "Currently, Mailria does not offer a remote logout feature. We recommend changing your password if you suspect unauthorized access, which will invalidate all existing sessions.",
        category: "account",
        order: 3,
      },
    ],
  },
  {
    key: "recovery",
    title: "Recovery (Binding) & Password Reset",
    items: [
      {
        id: "recovery-1",
        question: "What is a \"Binding Email\"?",
        answer: "A Binding Email is a recovery email address that you link to your Mailria account. It allows you to reset your password if you forget it. We strongly recommend setting up a Binding Email immediately after receiving your account.",
        category: "recovery",
        order: 1,
      },
      {
        id: "recovery-2",
        question: "Can I change my Binding Email later?",
        answer: "Yes, you can change your Binding Email from the Settings page. You'll need to verify the new email address before it becomes active as your recovery option.",
        category: "recovery",
        order: 2,
      },
      {
        id: "recovery-3",
        question: "Can I reset my password without a Binding Email?",
        answer: "No, password reset is only possible through your Binding Email. Mailria does not guarantee password recovery under any circumstances without a Binding Email. Loss of access due to forgotten credentials is the user's responsibility.",
        category: "recovery",
        order: 3,
      },
      {
        id: "recovery-4",
        question: "How long is the password reset code valid?",
        answer: "Password reset codes are valid for 15 minutes. If your code expires, you can request a new one from the Forgot Password page.",
        category: "recovery",
        order: 4,
      },
      {
        id: "recovery-5",
        question: "Can I bind my account to another Mailria address?",
        answer: "No, you cannot use another Mailria email as a Binding Email. The Binding Email must be from a different email provider (such as Gmail, Outlook, etc.) to ensure recovery access.",
        category: "recovery",
        order: 5,
      },
      {
        id: "recovery-6",
        question: "Why haven't I received my reset code?",
        answer: "Check your spam/junk folder first. If still not received, verify that your Binding Email is correct in your account settings. Reset codes may take a few minutes to arrive. Try requesting a new code if the issue persists.",
        category: "recovery",
        order: 6,
      },
    ],
  },
  {
    key: "outgoing",
    title: "Outgoing Mail (Limits & Attachments)",
    items: [
      {
        id: "outgoing-1",
        question: "Why am I limited to sending only 3 emails per day?",
        answer: "To maintain platform stability and prevent abuse, outgoing email sending is limited to a maximum of 3 emails per account per day. Mailria is not designed for bulk sending, campaigns, or ongoing communication. Attempts to bypass or abuse sending limits may result in immediate suspension.",
        category: "outgoing",
        order: 1,
      },
      {
        id: "outgoing-2",
        question: "What is the file size limit for attachments?",
        answer: "The maximum file size for attachments is 10MB per file, with a maximum of 10 files per email. Supported formats include PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, JPG, JPEG, PNG, GIF, ZIP, and RAR.",
        category: "outgoing",
        order: 2,
      },
    ],
  },
  {
    key: "incoming",
    title: "Incoming Mail & Storage",
    items: [
      {
        id: "incoming-1",
        question: "Is there a limit to how many emails I can receive?",
        answer: "There is no limit to the number of emails you can receive. However, emails older than 100 days are automatically and permanently deleted. Deleted emails cannot be recovered under any circumstances.",
        category: "incoming",
        order: 1,
      },
      {
        id: "incoming-2",
        question: "Why did my inbox suddenly become empty?",
        answer: "Emails older than 100 days are automatically deleted. Mailria does not offer long-term storage and does not maintain backups of user inboxes or content. If you need to keep important information, please save it elsewhere before it expires.",
        category: "incoming",
        order: 2,
      },
    ],
  },
  {
    key: "ownership",
    title: "Ownership & Trading",
    items: [
      {
        id: "ownership-1",
        question: "Can ownership of a Mailria account be transferred?",
        answer: "Yes, ownership can be transferred by sharing login credentials with the new owner. However, Mailria is not responsible for any disputes arising from account transfers. We recommend using secure marketplace escrow services for transactions.",
        category: "ownership",
        order: 1,
      },
      {
        id: "ownership-2",
        question: "Can I resell my Mailria account?",
        answer: "Yes, you may resell your Mailria account. Users do not own Mailria email addresses - all domains, email addresses, systems, and infrastructure remain the exclusive property of Mailria. Use of the service grants no ownership or intellectual property rights.",
        category: "ownership",
        order: 2,
      },
    ],
  },
  {
    key: "system",
    title: "System & Maintenance",
    items: [
      {
        id: "system-1",
        question: "Does Mailria have scheduled downtime?",
        answer: "Mailria may occasionally undergo scheduled maintenance. We try to minimize downtime and typically perform maintenance during low-traffic hours. Service interruptions or system failures may occur without notice, and Mailria shall not be liable for any disruptions.",
        category: "system",
        order: 1,
      },
    ],
  },
];

// Helper function to search FAQs
export function searchFaqs(query: string): FaqCategory[] {
  if (!query.trim()) {
    return faqData;
  }

  const lowerQuery = query.toLowerCase();

  return faqData
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(lowerQuery) ||
          item.answer.toLowerCase().includes(lowerQuery)
      ),
    }))
    .filter((category) => category.items.length > 0);
}

// Helper function to count total FAQ items
export function countFaqResults(categories: FaqCategory[]): number {
  return categories.reduce((acc, category) => acc + category.items.length, 0);
}
