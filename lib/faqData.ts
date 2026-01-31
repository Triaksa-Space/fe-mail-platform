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
        question: "What is Mailria?",
        answer: "Mailria is a secure email service designed for privacy-conscious users. We provide encrypted email communication with modern features and a user-friendly interface.",
        category: "general",
        order: 1,
      },
      {
        id: "general-2",
        question: "Is Mailria free to use?",
        answer: "Mailria offers both free and premium plans. The free plan includes basic email features with limited storage, while premium plans offer additional storage, custom domains, and advanced features.",
        category: "general",
        order: 2,
      },
      {
        id: "general-3",
        question: "What makes Mailria different from other email services?",
        answer: "Mailria focuses on privacy and security. We use end-to-end encryption, don't track user behavior for advertising, and provide a clean, ad-free experience.",
        category: "general",
        order: 3,
      },
    ],
  },
  {
    key: "registration",
    title: "Registration & Acquisition",
    items: [
      {
        id: "registration-1",
        question: "How do I create a Mailria account?",
        answer: "You can create a Mailria account by visiting our website and clicking 'Sign Up'. Follow the registration process, choose your email address, and set a secure password.",
        category: "registration",
        order: 1,
      },
      {
        id: "registration-2",
        question: "Can I choose my own email address?",
        answer: "Yes, you can choose your preferred username during registration. The email address will be in the format username@mailria.com. Some usernames may already be taken.",
        category: "registration",
        order: 2,
      },
      {
        id: "registration-3",
        question: "Is there a verification process?",
        answer: "Yes, we verify new accounts to prevent abuse. You may need to complete email verification or additional security checks depending on your region.",
        category: "registration",
        order: 3,
      },
    ],
  },
  {
    key: "account",
    title: "Account, Login, & Security",
    items: [
      {
        id: "account-1",
        question: "How do I log in to my Mailria account?",
        answer: "Visit the Mailria login page, enter your email address and password, then click 'Login'. Make sure you're using the correct credentials.",
        category: "account",
        order: 1,
      },
      {
        id: "account-2",
        question: "How do I change my password?",
        answer: "Go to Settings > Account Security > Change Password. Enter your current password, then your new password twice to confirm. Your new password should be at least 6 characters long.",
        category: "account",
        order: 2,
      },
      {
        id: "account-3",
        question: "What should I do if I suspect unauthorized access?",
        answer: "Immediately change your password and review your recent account activity. Enable two-factor authentication if not already active. Contact support if you notice any suspicious activity.",
        category: "account",
        order: 3,
      },
      {
        id: "account-4",
        question: "How do I enable two-factor authentication?",
        answer: "Go to Settings > Security > Two-Factor Authentication. Follow the setup wizard to link your authenticator app. You'll need to enter a verification code each time you log in.",
        category: "account",
        order: 4,
      },
    ],
  },
  {
    key: "recovery",
    title: "Recovery (Binding) & Password Reset",
    items: [
      {
        id: "recovery-1",
        question: "I forgot my password. How can I reset it?",
        answer: "Click 'Forgot Password' on the login page. Enter your email address and follow the instructions sent to your recovery email or phone number to reset your password.",
        category: "recovery",
        order: 1,
      },
      {
        id: "recovery-2",
        question: "What is account binding?",
        answer: "Account binding links your Mailria account to a recovery email or phone number. This allows you to recover your account if you forget your password or lose access.",
        category: "recovery",
        order: 2,
      },
      {
        id: "recovery-3",
        question: "How do I set up a recovery email?",
        answer: "Go to Settings > Account Recovery > Add Recovery Email. Enter an alternative email address and verify it by clicking the link sent to that address.",
        category: "recovery",
        order: 3,
      },
    ],
  },
  {
    key: "outgoing",
    title: "Outgoing Mail (Limits & Attachments)",
    items: [
      {
        id: "outgoing-1",
        question: "What is the daily sending limit?",
        answer: "Free accounts can send up to 3 emails per day. Premium accounts have higher limits depending on the plan. Limits reset at midnight UTC.",
        category: "outgoing",
        order: 1,
      },
      {
        id: "outgoing-2",
        question: "What is the maximum attachment size?",
        answer: "The maximum attachment size is 25MB per email. For larger files, we recommend using cloud storage links.",
        category: "outgoing",
        order: 2,
      },
      {
        id: "outgoing-3",
        question: "Why was my email marked as spam?",
        answer: "Emails may be marked as spam due to content triggers, sending to many recipients at once, or recipient email server policies. Avoid using spam trigger words and maintain a good sending reputation.",
        category: "outgoing",
        order: 3,
      },
    ],
  },
  {
    key: "incoming",
    title: "Incoming Mail & Storage",
    items: [
      {
        id: "incoming-1",
        question: "How much storage do I have?",
        answer: "Free accounts include 500MB of storage. Premium plans offer 5GB to unlimited storage depending on the tier. You can check your usage in Settings > Storage.",
        category: "incoming",
        order: 1,
      },
      {
        id: "incoming-2",
        question: "Why am I not receiving emails?",
        answer: "Check your spam/junk folder first. Verify that the sender has the correct email address. If issues persist, check if your storage is full or contact support.",
        category: "incoming",
        order: 2,
      },
      {
        id: "incoming-3",
        question: "How long are emails stored?",
        answer: "Emails are stored indefinitely as long as your account is active and you have available storage. Deleted emails are permanently removed after 30 days from the trash.",
        category: "incoming",
        order: 3,
      },
    ],
  },
  {
    key: "ownership",
    title: "Ownership & Trading",
    items: [
      {
        id: "ownership-1",
        question: "Can I transfer my Mailria account to someone else?",
        answer: "Account transfers are not officially supported for security reasons. Each user should create their own account with their own credentials.",
        category: "ownership",
        order: 1,
      },
      {
        id: "ownership-2",
        question: "What happens to my account if I stop using it?",
        answer: "Inactive accounts may be suspended after 12 months of no activity. We send warning emails before any action is taken. Log in periodically to keep your account active.",
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
        question: "When does Mailria perform maintenance?",
        answer: "Scheduled maintenance typically occurs on weekends between 2:00 AM - 6:00 AM UTC. We announce major maintenance in advance via email and our status page.",
        category: "system",
        order: 1,
      },
      {
        id: "system-2",
        question: "How do I report a bug or issue?",
        answer: "You can report bugs through Settings > Help > Report Issue, or email our support team directly. Please include details about your browser, device, and steps to reproduce the issue.",
        category: "system",
        order: 2,
      },
      {
        id: "system-3",
        question: "Is there a mobile app?",
        answer: "Currently, Mailria is available as a web application optimized for mobile browsers. Native iOS and Android apps are in development and will be announced soon.",
        category: "system",
        order: 3,
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
