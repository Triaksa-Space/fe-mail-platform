"use client";

import React, { Suspense, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Email } from "@/types/email";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Sidebar,
  InboxList,
  Preview,
  BottomTabs,
  ComposeModal,
  SettingsPanel,
  Mail,
  ViewType,
  transformEmailToMail,
} from "@/components/mail";

// Loading fallback
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-[#F9FAFB]">
    <div className="text-gray-500">Loading...</div>
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

  // UI state
  const [authLoaded, setAuthLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Mail | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Data state
  const [userEmail, setUserEmail] = useState("");
  const [emails, setEmails] = useState<Mail[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      (email) => email.email_encode_id === emailParam || email.id === emailParam
    );

    if (emailToSelect) {
      setSelectedEmail(emailToSelect);
      setShowMobilePreview(true);
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
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];

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

  // Fetch sent count
  const fetchSentCount = async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/sent/by_user`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        setSentCount(response.data.SentEmails);
        setEmail(response.data.Email);
        setUserEmail(response.data.Email);
      }
    } catch (err) {
      console.error("Failed to fetch sent count:", err);
    }
  };

  // Fetch emails
  const fetchEmails = useCallback(
    async (signal?: AbortSignal) => {
      if (isRequestInProgressRef.current) return;
      if (!isPageVisibleRef.current || isUserIdle()) return;

      isRequestInProgressRef.current = true;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/by_user`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }
        );

        const transformedEmails = response.data.map((email: Email) =>
          transformEmailToMail(email)
        );
        setEmails(transformedEmails);
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
    [token, isUserIdle]
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
  }, [authLoaded, storedToken, roleId, sentStatus, token, router, setEmail, fetchEmails, isUserIdle]);

  // Handlers
  const handleSelectEmail = (email: Mail) => {
    setSelectedEmail(email);
    setShowMobilePreview(true);
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view === "compose") {
      setIsComposeOpen(true);
    } else {
      setShowMobilePreview(false);
      setSelectedEmail(null);
    }
  };

  const handleCompose = () => {
    setIsComposeOpen(true);
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    setIsComposeOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const handleEmailSent = () => {
    fetchSentCount();
    handleRefresh();
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
          <div className="hidden lg:flex flex-1">
            <SettingsPanel />
          </div>
        </>
      );
    }

    // Inbox view - handle both mobile and desktop
    return (
      <>
        {/* Mobile view */}
        {showMobilePreview && selectedEmail ? (
          // Mobile: show preview when email is selected
          <Preview
            email={selectedEmail}
            onBack={() => setShowMobilePreview(false)}
            onReply={handleReply}
            showBackButton={true}
            className="lg:hidden flex-1"
          />
        ) : (
          // Mobile: show inbox list when no email is selected
          <InboxList
            emails={emails}
            selectedId={selectedEmail?.email_encode_id || null}
            onSelect={handleSelectEmail}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            error={error}
            fullWidth={true}
            className="lg:hidden flex-1"
          />
        )}

        {/* Desktop: Always show Inbox list + Preview side by side */}
        <div className="hidden lg:flex flex-1">
          <InboxList
            emails={emails}
            selectedId={selectedEmail?.email_encode_id || null}
            onSelect={handleSelectEmail}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            error={error}
            fullWidth={!selectedEmail}
          />
          {selectedEmail && (
            <Preview
              email={selectedEmail}
              onReply={handleReply}
              showBackButton={false}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="h-screen bg-[#F9FAFB] flex overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        onCompose={handleCompose}
        onLogout={handleLogout}
        userEmail={userEmail}
        sentCount={sentCount}
        className="hidden lg:flex"
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <h1 className="text-sm font-medium text-gray-900 truncate">
            {userEmail}
          </h1>
          <span className="text-xs text-gray-500">
            Daily: {sentCount}/3
          </span>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden pb-20 lg:pb-0">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Tabs */}
      <BottomTabs
        currentView={currentView}
        onViewChange={handleViewChange}
        onCompose={handleCompose}
        onLogout={handleLogout}
      />

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSent={handleEmailSent}
        sentCount={sentCount}
        maxDailySend={3}
        replyTo={
          selectedEmail
            ? { email: selectedEmail.fromEmail, subject: selectedEmail.subject }
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
