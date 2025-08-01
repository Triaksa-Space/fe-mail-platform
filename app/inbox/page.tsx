"use client";

import React, { Suspense } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { Email } from "@/types/email";
import FooterNav from "@/components/FooterNav";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { theme } from "../theme";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-full">Loading...</div>
);

const InboxPageContent: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const roleId = useAuthStore((state) => state.roleId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentStatus = searchParams.get("sent");
  const [sentEmails, setSentEmails] = useState(0);
  const [email, setEmailLocal] = useState("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshingSecond, setIsRefreshingSecond] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storedToken = useAuthStore.getState().getStoredToken();
  const { setEmail } = useAuthStore();

  // Check if the auth store is ready
  const [authLoaded, setAuthLoaded] = useState(false);

  // Refs for managing requests and intervals
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRequestInProgressRef = useRef(false);
  const lastActivityRef = useRef(Date.now());
  const isPageVisibleRef = useRef(true);

  // Constants for timing
  const AUTO_REFRESH_INTERVAL = 60000; // 1 minute
  const IDLE_TIMEOUT = 300000; // 5 minutes of inactivity before considering idle

  useEffect(() => {
    // Wait for the auth store to load and set the state
    setAuthLoaded(true);
  }, []);

  // Redirect logic inside useEffect
  useEffect(() => {
    if (!authLoaded) return; // Wait until auth is loaded

    if (!storedToken) {
      router.replace("/");
    } else if (roleId === 0 || roleId === 2) {
      router.replace("/not-found");
    }
  }, [authLoaded, storedToken, roleId, router]);

  // User activity tracking
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Check if user is idle
  const isUserIdle = useCallback(() => {
    return Date.now() - lastActivityRef.current > IDLE_TIMEOUT;
  }, []);

  // Page visibility change handler
  const handleVisibilityChange = useCallback(() => {
    isPageVisibleRef.current = !document.hidden;
    if (!document.hidden) {
      updateLastActivity();
    }
  }, [updateLastActivity]);

  // Set up activity listeners and page visibility
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateLastActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateLastActivity, handleVisibilityChange]);

  const fetchCountSentEmails = async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/sent/by_user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setSentEmails(response.data.SentEmails);
        setEmail(response.data.Email);
        setEmailLocal(response.data.Email);
      }
    } catch (err) {
      console.error("Failed to fetch sent emails count:", err);
    }
  };

  const fetchEmails = useCallback(async (signal?: AbortSignal) => {
    // Prevent duplicate requests
    if (isRequestInProgressRef.current) {
      console.log("Request already in progress, skipping...");
      return;
    }

    // Don't auto-refresh if page is not visible or user is idle
    if (!isPageVisibleRef.current || isUserIdle()) {
      console.log("Skipping refresh: page not visible or user idle");
      return;
    }

    isRequestInProgressRef.current = true;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/email/by_user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      );

      setEmails(response.data);
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
  }, [token, isUserIdle]);

  // Manual refresh with loading states
  const handleRefresh = useCallback(() => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setIsRefreshing(true);
    updateLastActivity(); // Update activity on manual refresh
    
    fetchEmails(abortControllerRef.current.signal).finally(() => {
      setTimeout(() => {
        setIsRefreshingSecond(true);
        setIsRefreshing(false);
      }, 1000);
    });
  }, [fetchEmails, updateLastActivity]);

  useEffect(() => {
    if(isRefreshingSecond) {
      setTimeout(() => {
        setIsRefreshingSecond(false);
      }, 3000);
    }
  }, [isRefreshingSecond]);

  useEffect(() => {
    if (!authLoaded) return; // Wait until auth is loaded
    if (!storedToken || roleId === 0 || roleId === 2) return; // Don't proceed if not authorized
    

    if (sentStatus === "success") {
      toast({
        description: "Send email successful!",
        variant: "default",
      });
      // Remove the query parameter from the URL
      router.replace("/inbox");
    }

    // Initial data fetch
    fetchCountSentEmails();
    
    // Create abort controller for initial fetch
    abortControllerRef.current = new AbortController();
    fetchEmails(abortControllerRef.current.signal);

    // Set up interval for auto-refresh (1 minute)
    intervalRef.current = setInterval(() => {
      // Only auto-refresh if page is visible and user is not idle
      if (isPageVisibleRef.current && !isUserIdle()) {
        // Create new abort controller for auto-refresh
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        fetchEmails(abortControllerRef.current.signal);
      }
    }, AUTO_REFRESH_INTERVAL);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isRequestInProgressRef.current = false;
    };
  }, [authLoaded, storedToken, roleId, sentStatus, token, router, setEmail, fetchEmails, isUserIdle]);

  return (
    <div
      className="flex h-[100dvh] flex-col"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Fixed Header */}
      <header
        className="flex justify-between items-center p-2 truncate"
        style={{
          backgroundColor: theme.colors.primary,
          boxShadow: theme.shadows.card,
        }}
      >
        <h1
          className="text-l font-semibold tracking-tight"
          style={{ color: theme.colors.textPrimary }}
        >
          {email}
        </h1>
        <h1>
          <Button
            className="hover:bg-[#F5E193]"
            variant="ghost"
            size="icon"
            disabled={isRefreshing || isRefreshingSecond || isRequestInProgressRef.current}
            onClick={handleRefresh}
          >
            <RefreshCw className="h-6 w-6" />
          </Button>
        </h1>
        <h1
          className="text-sm font-semibold tracking-tight"
          style={{ color: theme.colors.textPrimary }}
        >
          Daily Send {sentEmails}/3
        </h1>
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="space-y-0.5">
          {isRefreshing &&  (
            <div className="p-2 text-center absolute top-0 left-0 right-0 mx-auto bg-yellow-100 w-fit rounded border border-yellow-500 z-10 mt-3">Loading...</div>
          )}
          {isLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : error ? (
            <div
              className="p-4 text-center"
              style={{ color: theme.colors.error }}
            >
              {error}
            </div>
          ) : emails.length > 0 ? (
            <div className="divide-y">
              {emails.map((email) => (
                <div
                  key={email.ID}
                  className={`p-4 cursor-pointer transform transition duration-300 ease-in-out hover:scale-101 hover:shadow-lg hover:bg-gray-100 
                      ${!email.IsRead ? "bg-[#F2F6FC]" : ""}`}
                  onClick={() => router.push(`/inbox/${email.email_encode_id}`)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className="font-semibold truncate"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {email.SenderName}
                      </h3>
                      <span
                        className="text-sm"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {email.RelativeTime}
                      </span>
                    </div>
                    <h4
                      className="font-medium truncate"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {email.Subject}
                    </h4>
                    <p
                      className="text-sm truncate"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {email.Preview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-4 text-center cursor-pointer text-blue-500 underline"
              onClick={() => window.location.reload()}
            >
              No emails found. Please refresh your browser.
            </div>
          )}
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="w-full z-10">
        <FooterNav />
      </footer>

      <Toaster />
    </div>
  );
};

// Wrap InboxPageContent with Suspense
const InboxPage: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <InboxPageContent />
  </Suspense>
);

export default InboxPage;
