"use client";

import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { apiClient } from "@/lib/api-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Email } from "@/types/email";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Sidebar,
  InboxList,
  SentList,
  Preview,
  BottomTabs,
  ComposeModal,
  SettingsPanel,
  Mail,
  SentMail,
  ApiSentEmail,
  ApiSentEmailDetail,
  ViewType,
  ForwardData,
  transformEmailToMail,
  transformSentEmail,
  InboxListSkeleton,
} from "@/components/mail";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionTimeout } from "@/hooks/use-session-timeout";

// Loading fallback with proper skeleton layout
const LoadingFallback: React.FC = () => (
  <div className="h-screen bg-[#F9FAFB] flex overflow-hidden">
    {/* Sidebar skeleton - desktop only */}
    <div className="hidden lg:flex w-64 flex-col bg-white border-r border-neutral-200 p-4">
      {/* Logo area */}
      <Skeleton className="h-8 w-24 mb-6" />
      {/* Compose button */}
      <Skeleton className="h-10 w-full rounded-xl mb-4" />
      {/* Nav items */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      {/* User info at bottom */}
      <div className="mt-auto">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>

    {/* Main content area */}
    <main className="flex-1 flex flex-col min-w-0">
      {/* Mobile header skeleton */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-16" />
      </header>

      {/* Inbox list skeleton */}
      <div className="flex-1 flex overflow-hidden pb-20 lg:pb-0">
        <InboxListSkeleton rowCount={8} showHeader={true} fullWidth={true} />
      </div>
    </main>

    {/* Mobile bottom tabs skeleton */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3">
      <div className="flex justify-around">
        <Skeleton className="h-10 w-16 rounded-lg" />
        <Skeleton className="h-10 w-16 rounded-lg" />
        <Skeleton className="h-10 w-16 rounded-lg" />
        <Skeleton className="h-10 w-16 rounded-lg" />
      </div>
    </div>
  </div>
);

const InboxPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentStatus = searchParams.get("sent");
  const composeParam = searchParams.get("compose");
  const viewParam = searchParams.get("view");
  const emailParam = searchParams.get("email");

  // Auth state
  const token = useAuthStore((state) => state.token);
  const roleId = useAuthStore((state) => state.roleId);
  const logout = useAuthStore((state) => state.logout);
  const { setEmail } = useAuthStore();
  const storedToken = useAuthStore.getState().getStoredToken();

  useSessionTimeout();

  // UI state
  const [authLoaded, setAuthLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Mail | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [forwardData, setForwardData] = useState<ForwardData | undefined>(undefined);

  // Data state
  const [userEmail, setUserEmail] = useState("");
  const [emails, setEmails] = useState<Mail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentMail[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [maxDailySend, setMaxDailySend] = useState(3);
  const [resetsAt, setResetsAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSentLoading, setIsSentLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSentRefreshing, setIsSentRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentError, setSentError] = useState<string | null>(null);
  const [selectedSentEmail, setSelectedSentEmail] = useState<SentMail | null>(
    null,
  );
  const [sentEmailDetail, setSentEmailDetail] =
    useState<ApiSentEmailDetail | null>(null);
  const [isSentDetailLoading, setIsSentDetailLoading] = useState(false);

  // Refs for managing requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRequestInProgressRef = useRef(false);
  const lastActivityRef = useRef(Date.now());
  const isPageVisibleRef = useRef(true);

  // Constants
  const AUTO_REFRESH_INTERVAL = 60000;
  const IDLE_TIMEOUT = 300000;

  // Initialize auth
  useEffect(() => {
    setAuthLoaded(true);
  }, []);

  // Update page title based on current view
  useEffect(() => {
    switch (currentView) {
      case "sent":
        document.title = "Sent - Mailria";
        break;
      case "settings":
        document.title = "Settings - Mailria";
        break;
      default:
        document.title = "Inbox - Mailria";
    }
  }, [currentView]);

  // Handle URL query parameters for routing
  useEffect(() => {
    if (!authLoaded) return;

    // Handle compose parameter
    if (composeParam === "true") {
      setIsComposeOpen(true);
      router.replace("/inbox");
    }

    // Handle view parameter
    if (viewParam === "settings") {
      setCurrentView("settings");
      router.replace("/inbox");
    }
  }, [authLoaded, composeParam, viewParam, router]);

  // Handle email parameter to auto-select email
  useEffect(() => {
    if (!authLoaded || !emailParam || emails.length === 0) return;

    const emailToSelect = emails.find(
      (email) =>
        email.email_encode_id === emailParam || email.id === emailParam,
    );

    if (emailToSelect) {
      const readEmail = { ...emailToSelect, unread: false };
      setSelectedEmail(readEmail);
      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.email_encode_id === readEmail.email_encode_id
            ? { ...item, unread: false }
            : item,
        ),
      );
      router.replace("/inbox");
    }
  }, [authLoaded, emailParam, emails, router]);

  // Auth redirect
  useEffect(() => {
    if (!authLoaded) return;

    if (!storedToken) {
      router.replace("/");
    } else if (roleId === 0 || roleId === 2) {
      router.replace("/not-found");
    }
  }, [authLoaded, storedToken, roleId, router]);

  // Activity tracking
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const isUserIdle = useCallback(() => {
    return Date.now() - lastActivityRef.current > IDLE_TIMEOUT;
  }, []);

  const handleVisibilityChange = useCallback(() => {
    isPageVisibleRef.current = !document.hidden;
    if (!document.hidden) {
      updateLastActivity();
    }
  }, [updateLastActivity]);

  // Activity listeners
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateLastActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updateLastActivity, handleVisibilityChange]);

  // Fetch email quota (sent count, limit, reset time)
  const fetchSentCount = async () => {
    if (!token) return;

    try {
      const response = await apiClient.get("/email/quota");

      if (response.data) {
        setSentCount(response.data.sent);
        setMaxDailySend(response.data.limit);
        setResetsAt(response.data.resets_at);
      }
    } catch (err) {
      console.error("Failed to fetch email quota:", err);
    }

    // Also fetch user email (still needed for display)
    try {
      const response = await apiClient.get("/email/sent/by_user");
      if (response.data) {
        setEmail(response.data.Email);
        setUserEmail(response.data.Email);
      }
    } catch (err) {
      console.error("Failed to fetch user email:", err);
    }
  };

  // Fetch sent emails list
  const fetchSentEmails = useCallback(
    async (isRefresh = false) => {
      if (!token) return;

      try {
        if (isRefresh) {
          setIsSentRefreshing(true);
        } else {
          setIsSentLoading(true);
        }
        setSentError(null);

        // Try the sent emails list endpoint
        const response = await apiClient.get("/email/sent/list");

        if (response.data && Array.isArray(response.data.data)) {
          const transformedEmails = response.data.data.map(
            (email: ApiSentEmail) => transformSentEmail(email),
          );
          setSentEmails(transformedEmails);
        } else if (response.data && Array.isArray(response.data)) {
          const transformedEmails = response.data.map((email: ApiSentEmail) =>
            transformSentEmail(email),
          );
          setSentEmails(transformedEmails);
        } else {
          setSentEmails([]);
        }
      } catch (err) {
        console.error("Failed to fetch sent emails:", err);
        setSentError("Failed to load sent emails");
      } finally {
        setIsSentLoading(false);
        setIsSentRefreshing(false);
      }
    },
    [token],
  );

  // Fetch sent email detail
  const fetchSentEmailDetail = useCallback(
    async (emailId: string) => {
      if (!token) return;

      try {
        setIsSentDetailLoading(true);
        const response = await apiClient.get(`/email/sent/detail/${emailId}`);

        if (response.data) {
          setSentEmailDetail(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch sent email detail:", err);
      } finally {
        setIsSentDetailLoading(false);
      }
    },
    [token],
  );

  // Fetch emails
  const fetchEmails = useCallback(
    async (signal?: AbortSignal) => {
      if (isRequestInProgressRef.current) return;
      if (!isPageVisibleRef.current || isUserIdle()) return;

      isRequestInProgressRef.current = true;

      try {
        const response = await apiClient.get("/email/by_user", { signal });

        const transformedEmails = response.data.map((email: Email) =>
          transformEmailToMail(email),
        );
        setEmails(transformedEmails);
        setSelectedEmail((prevSelected) => {
          if (!prevSelected) return null;
          return (
            transformedEmails.find(
              (item) => item.email_encode_id === prevSelected.email_encode_id,
            ) || prevSelected
          );
        });
        setError(null);
      } catch (err) {
        if (!signal?.aborted) {
          console.error("Failed to fetch emails:", err);
          setError("Failed to load emails");
        }
      } finally {
        isRequestInProgressRef.current = false;
        setIsLoading(false);
      }
    },
    [token, isUserIdle],
  );

  // Manual refresh
  const handleRefresh = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsRefreshing(true);
    updateLastActivity();

    fetchEmails(abortControllerRef.current.signal).finally(() => {
      setTimeout(() => setIsRefreshing(false), 1000);
    });
  }, [fetchEmails, updateLastActivity]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (!authLoaded) return;
    if (!storedToken || roleId === 0 || roleId === 2) return;

    if (sentStatus === "success") {
      toast({
        description: "Email sent successfully!",
        variant: "default",
      });
      router.replace("/inbox");
    }

    fetchSentCount();

    abortControllerRef.current = new AbortController();
    fetchEmails(abortControllerRef.current.signal);

    intervalRef.current = setInterval(() => {
      if (isPageVisibleRef.current && !isUserIdle()) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        fetchEmails(abortControllerRef.current.signal);
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      isRequestInProgressRef.current = false;
    };
  }, [
    authLoaded,
    storedToken,
    roleId,
    sentStatus,
    token,
    router,
    setEmail,
    fetchEmails,
    isUserIdle,
  ]);

  // Fetch sent emails when view changes to "sent"
  useEffect(() => {
    if (currentView === "sent" && sentEmails.length === 0) {
      fetchSentEmails();
    }
  }, [currentView, sentEmails.length, fetchSentEmails]);

  // Handlers
  const handleSelectEmail = (email: Mail) => {
    const readEmail = { ...email, unread: false };
    setSelectedEmail(readEmail);
    setEmails((prevEmails) =>
      prevEmails.map((item) =>
        item.email_encode_id === readEmail.email_encode_id
          ? { ...item, unread: false }
          : item,
      ),
    );
  };

  const handleSelectSentEmail = (email: SentMail) => {
    setSelectedSentEmail(email);
    setSentEmailDetail(null);
    fetchSentEmailDetail(email.id);
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view === "compose") {
      setIsComposeOpen(true);
    } else {
      setSelectedEmail(null);
      setSelectedSentEmail(null);
    }
  };

  const handleSentRefresh = useCallback(() => {
    fetchSentEmails(true);
  }, [fetchSentEmails]);

  const handleCompose = () => {
    setForwardData(undefined);
    setIsComposeOpen(true);
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    setForwardData(undefined);
    setIsComposeOpen(true);
  };

  const handleForward = (data: ForwardData) => {
    setForwardData(data);
    setIsComposeOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const handleEmailSent = () => {
    fetchSentCount();
    handleRefresh();
    // If on sent view, also refresh sent emails
    if (currentView === "sent") {
      fetchSentEmails(true);
    } else {
      // Reset sent emails so they get refetched when user switches to sent view
      setSentEmails([]);
    }
  };

  // Render content based on view
  const renderContent = () => {
    // Settings view
    if (currentView === "settings") {
      return (
        <>
          {/* Mobile settings */}
          <SettingsPanel
            onBack={() => setCurrentView("inbox")}
            showBackButton={true}
            className="lg:hidden"
          />
          {/* Desktop settings */}
          <div className="hidden lg:flex flex-1 min-w-0">
            <SettingsPanel className="flex-1 w-full min-w-0" />
          </div>
        </>
      );
    }

    // Sent view
    if (currentView === "sent") {
      // When sent email is selected, show preview full width
      if (selectedSentEmail) {
        // Use detail data if available, otherwise use list data
        const detail = sentEmailDetail;
        const mailForPreview: Mail = {
          id: selectedSentEmail.id,
          email_encode_id: selectedSentEmail.id,
          user_encode_id: selectedSentEmail.user_id,
          from: detail?.from || selectedSentEmail.from,
          fromEmail: detail?.from || selectedSentEmail.from,
          to: detail?.to || selectedSentEmail.to,
          subject: detail?.subject || selectedSentEmail.subject,
          snippet: detail?.body_preview || selectedSentEmail.snippet,
          body: detail?.body || selectedSentEmail.snippet,
          date: selectedSentEmail.date,
          unread: false,
          // Convert string[] to JSON string if needed for consistent handling
          attachments: Array.isArray(detail?.attachments)
            ? JSON.stringify(detail.attachments)
            : detail?.attachments,
        };

        return (
          <Preview
            email={mailForPreview}
            onBack={() => {
              setSelectedSentEmail(null);
              setSentEmailDetail(null);
            }}
            showBackButton={true}
            className="flex-1"
            isSentView={true}
            isSentDetailLoading={isSentDetailLoading}
          />
        );
      }

      // No sent email selected - show full width sent list
      return (
        <SentList
          emails={sentEmails}
          selectedId={null}
          onSelect={handleSelectSentEmail}
          onRefresh={handleSentRefresh}
          onCompose={handleCompose}
          isLoading={isSentLoading}
          isRefreshing={isSentRefreshing}
          error={sentError}
          fullWidth={true}
          className="flex-1"
          userEmail={userEmail}
          sentCount={sentCount}
          isComposeOpen={isComposeOpen}
        />
      );
    }

    // Inbox view - show one view at a time (full width)
    // When email is selected, show preview full width
    // When no email selected, show inbox list full width
    if (selectedEmail) {
      return (
        <Preview
          email={selectedEmail}
          onBack={() => setSelectedEmail(null)}
          onReply={handleReply}
          onForward={handleForward}
          showBackButton={true}
          className="flex-1"
        />
      );
    }

    // No email selected - show full width inbox list
    return (
      <InboxList
        emails={emails}
        selectedId={null}
        onSelect={handleSelectEmail}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        fullWidth={true}
        className="flex-1"
        userEmail={userEmail}
        sentCount={sentCount}
      />
    );
  };

  return (
    <div className="h-screen min-h-dvh relative flex flex-col overflow-hidden w-full">
      <div className="self-stretch flex-1 pt-4 lg:py-5 px-4 lg:px-5 inline-flex justify-start items-start overflow-hidden">
        {/* Desktop Sidebar - LEFT side */}
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
          sentCount={sentCount}
          unreadCount={emails.filter((email) => email.unread).length}
          userEmail={userEmail}
          className="hidden lg:flex h-full"
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 h-full lg:pb-0 ">
          {/* Content Area - Card only on desktop */}
          <div className="h-full flex flex-col overflow-hidden lg:pl-5 lg:rounded-xl">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Background glow */}
      {!selectedEmail && !selectedSentEmail && (
        <div
          className="lg:hidden fixed left-[calc(50%-2500px)] bottom-[-4916px] w-[5000px] h-[5000px] rounded-[5000px] bg-[var(--primary-50)] blur-[32px] pointer-events-none z-40"
          aria-hidden="true"
        />
      )}

      {/* Mobile Bottom Tabs */}
      {!selectedEmail && !selectedSentEmail && (
        <BottomTabs
          currentView={currentView}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
          unreadCount={emails.filter((email) => email.unread).length}
        />
      )}

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          setForwardData(undefined);
        }}
        onSent={handleEmailSent}
        sentCount={sentCount}
        maxDailySend={maxDailySend}
        resetsAt={resetsAt}
        forwardData={forwardData}
        replyTo={
          !forwardData && selectedEmail
            ? {
                email: selectedEmail.fromEmail || selectedEmail.from,
                subject: selectedEmail.subject,
                from: selectedEmail.from,
                date: selectedEmail.date,
                body: selectedEmail.body,
              }
            : undefined
        }
      />

      <Toaster />
    </div>
  );
};

// Wrap with Suspense
const InboxPage: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <InboxPageContent />
  </Suspense>
);

export default InboxPage;
