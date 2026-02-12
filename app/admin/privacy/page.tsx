"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLoadingPlaceholder from "@/components/admin/AdminLoadingPlaceholder";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";

interface PrivacyResponse {
  content: string;
  effective_date: string;
}

// DOMPurify config for safe HTML rendering
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "strong", "b", "em", "i", "u", "s", "strike",
    "a", "span", "div",
    "table", "thead", "tbody", "tr", "th", "td",
    "blockquote", "pre", "code"
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "style"],
  ALLOW_DATA_ATTR: false,
};

const LoadingFallback: React.FC = () => (
  <AdminLoadingPlaceholder heightClassName="min-h-[400px]" />
);

const AdminPrivacyPageContent: React.FC = () => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const roleId = useAuthStore((state) => state.roleId);
  const storedToken = useAuthStore.getState().getStoredToken();
  const { toast } = useToast();

  const editorRef = useRef<TinyMCEEditor | null>(null);

  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState<string>("");

  // Auth check
  useEffect(() => {
    setAuthLoaded(true);
  }, []);

  // Set page title
  useEffect(() => {
    document.title = "Privacy Policy - Admin Mailria";
  }, []);

  useEffect(() => {
    if (!authLoaded) return;

    if (!storedToken) {
      router.replace("/");
      return;
    }

    if (roleId === 1) {
      router.replace("/not-found");
    }
  }, [authLoaded, storedToken, roleId, router]);

  // Fetch current privacy content
  useEffect(() => {
    const fetchPrivacy = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await apiClient.get<PrivacyResponse>("/content/privacy");
        setContent(response.data.content || "");
        setOriginalContent(response.data.content || "");
        setEffectiveDate(response.data.effective_date || "");
      } catch (err) {
        console.error("Failed to fetch privacy policy:", err);
        toast({
          description: "Failed to load Privacy Policy content.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (authLoaded && token) {
      fetchPrivacy();
    }
  }, [authLoaded, token, toast]);

  // Sanitize HTML content on client side only
  useEffect(() => {
    if (typeof window !== "undefined" && content) {
      import("dompurify").then((DOMPurify) => {
        const clean = DOMPurify.default.sanitize(content, DOMPURIFY_CONFIG);
        setSanitizedContent(clean);
      });
    }
  }, [content]);

  const handleEdit = () => {
    setOriginalContent(content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setContent(originalContent);
    setIsEditing(false);
  };

  // Save privacy content
  const handleSave = async () => {
    if (!token) return;

    try {
      setIsSaving(true);
      await apiClient.put("/admin/content/privacy", {
        content: content,
        effective_date: effectiveDate,
      });

      setOriginalContent(content);
      setIsEditing(false);

      toast({
        description: "Privacy Policy updated successfully.",
        variant: "default",
      });
    } catch (error) {
      let errorMessage = "Failed to save Privacy Policy. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.message;
      }
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!authLoaded || roleId === 1) {
    return <LoadingFallback />;
  }

  return (
    <AdminLayout>
      <Toaster />
      <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
        {/* Page Header */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="justify-center text-neutral-800 text-2xl font-semibold font-['Roboto'] leading-8">
            Privacy policy
          </div>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-5 h-5 text-neutral-800" />
                <span className="text-center text-neutral-700 text-base font-medium font-['Roboto'] leading-4">
                  Cancel
                </span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="h-10 px-4 py-2.5 btn-primary-skin flex justify-center items-center gap-2 overflow-hidden transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : null}
                <span className="text-center text-base font-medium font-['Roboto'] leading-4">
                  {isSaving ? "Saving..." : "Save Changes"}
                </span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-neutral-50 transition-colors"
            >
              <PencilSquareIcon className="w-5 h-5 text-neutral-800" />
              <span className="text-center text-neutral-700 text-base font-medium font-['Roboto'] leading-4">
                Edit
              </span>
            </Button>
          )}
        </div>

        {/* Content Card */}
        <div className="self-stretch flex-1 p-6 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] flex flex-col justify-start items-start gap-4 overflow-hidden">
          {isLoading ? (
            <LoadingFallback />
          ) : isEditing ? (
            /* Editor Mode */
            <div className="self-stretch flex-1 bg-neutral-100 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col justify-start items-start overflow-hidden">
              <div className="self-stretch flex-1 relative">
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  onInit={(_evt: unknown, editor: TinyMCEEditor) => {
                    editorRef.current = editor;
                    setEditorReady(true);
                  }}
                  value={content}
                  onEditorChange={(newContent: string) => setContent(newContent)}
                  init={{
                    height: 600,
                    menubar: false,
                    plugins: [
                      "advlist", "autolink", "lists", "link", "charmap",
                      "anchor", "searchreplace", "visualblocks", "code",
                      "insertdatetime", "table", "code", "help", "wordcount"
                    ],
                    toolbar:
                      "undo redo | blocks | " +
                      "bold italic underline strikethrough | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | " +
                      "link | removeformat",
                    content_style: `
                      body {
                        max-width: 860px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: Roboto, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
                        background: #ffffff;
                      }

                      h2 {
                        color: var(--Neutral-800, #1F2937);
                        font-size: 16px;
                        font-weight: 600;
                        line-height: 24px;
                        margin: 24px 0 10px;
                        padding-top: 8px;
                      }

                      h2:first-of-type {
                        border-top: 0;
                        padding-top: 0;
                        margin-top: 12px;
                      }

                      p {
                        color: var(--Neutral-600, #4B5563);
                        font-size: 14px;
                        font-weight: 400;
                        line-height: 20px;
                        margin: 8px 0;
                      }

                      strong {
                        color: var(--Neutral-800, #1F2937);
                        font-weight: 600;
                      }

                      ul, ol {
                        margin: 8px 0 12px;
                        padding-left: 18px;
                        color: var(--Neutral-600, #4B5563);
                        font-size: 14px;
                        font-weight: 400;
                        line-height: 20px;
                      }

                      li {
                        margin: 6px 0;
                      }

                      li p {
                        margin: 0;
                      }

                      a {
                        color: var(--Neutral-800, #1F2937);
                        text-decoration: underline;
                        text-underline-offset: 0px;
                      }

                      a:hover {
                        text-decoration-thickness: 2px;
                      }
                    `,
                    branding: false,
                    promotion: false,
                    statusbar: false,
                  }}
                />
                {!editorReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="self-stretch flex-1 bg-neutral-100 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col justify-start items-start overflow-hidden">
              {/* Disabled Toolbar (visual only) */}
              <div className="self-stretch p-2 bg-neutral-300 inline-flex justify-start items-center gap-5">
                <div className="flex justify-start items-start gap-2">
                  <div className="h-7 px-2 rounded flex justify-center items-center">
                    <span className="text-neutral-500 text-sm font-normal">Paragraph</span>
                  </div>
                </div>
              </div>
              {/* Content Display */}
              <div className="self-stretch p-5 flex flex-col justify-start items-start gap-5 overflow-y-auto max-h-[600px]">
                <div
                  className="prose prose-sm max-w-none text-neutral-400 leading-relaxed
                    prose-headings:text-neutral-400 prose-headings:font-semibold
                    prose-h1:text-2xl prose-h2:text-base prose-h3:text-base
                    prose-p:mb-3 prose-ul:my-2 prose-ol:my-2
                    prose-li:my-1 prose-a:text-primary-500 prose-a:underline
                    prose-strong:text-neutral-400"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminPrivacyPage: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminPrivacyPageContent />
  </Suspense>
);

export default AdminPrivacyPage;



