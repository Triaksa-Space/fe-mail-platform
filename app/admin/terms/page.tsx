"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface TermsResponse {
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
  <div className="flex justify-center items-center h-full min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
  </div>
);

const AdminTermsPageContent: React.FC = () => {
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
    document.title = "Terms of Service - Admin Mailria";
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

  // Fetch current terms content
  useEffect(() => {
    const fetchTerms = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await apiClient.get<TermsResponse>("/content/terms");
        setContent(response.data.content || "");
        setOriginalContent(response.data.content || "");
        setEffectiveDate(response.data.effective_date || "");
      } catch (err) {
        console.error("Failed to fetch terms:", err);
        toast({
          description: "Failed to load Terms of Services content.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (authLoaded && token) {
      fetchTerms();
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

  // Handle edit mode
  const handleEdit = () => {
    setOriginalContent(content);
    setIsEditing(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setContent(originalContent);
    setIsEditing(false);
  };

  // Save terms content
  const handleSave = async () => {
    if (!token) return;

    try {
      setIsSaving(true);
      await apiClient.put("/admin/content/terms", {
        content: content,
        effective_date: effectiveDate,
      });

      setOriginalContent(content);
      setIsEditing(false);

      toast({
        description: "Terms of Services updated successfully.",
        variant: "default",
      });
    } catch (error) {
      let errorMessage = "Failed to save Terms of Services. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
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
          <div className="justify-center text-gray-800 text-2xl font-semibold font-['Roboto'] leading-8">
            Terms of services
          </div>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-5 h-5 text-gray-800" />
                <span className="text-center text-gray-700 text-base font-medium font-['Roboto'] leading-4">Cancel</span>
              </button>
              <button
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
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-2 overflow-hidden hover:bg-gray-50 transition-colors"
            >
              <PencilSquareIcon className="w-5 h-5 text-gray-800" />
              <span className="text-center text-gray-700 text-base font-medium font-['Roboto'] leading-4">Edit</span>
            </button>
          )}
        </div>

        {/* Content Card */}
        <div className="self-stretch flex-1 p-6 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] flex flex-col justify-start items-start gap-4 overflow-hidden">
          {isLoading ? (
            <LoadingFallback />
          ) : isEditing ? (
            /* Editor Mode */
            <div className="self-stretch flex-1 bg-gray-100 rounded-md outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start overflow-hidden">
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
                    content_style:
                      "body { font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6; color: #374151; padding: 20px; }",
                    branding: false,
                    promotion: false,
                    statusbar: false,
                  }}
                />
                {!editorReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="self-stretch flex-1 bg-gray-100 rounded-md outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start overflow-hidden">
              {/* Disabled Toolbar (visual only) */}
              <div className="self-stretch p-2 bg-gray-300 inline-flex justify-start items-center gap-5">
                <div className="flex justify-start items-start gap-2">
                  <div className="h-7 px-2 rounded flex justify-center items-center">
                    <span className="text-gray-500 text-sm font-normal">Paragraph</span>
                  </div>
                </div>
              </div>
              {/* Content Display */}
              <div className="self-stretch p-5 flex flex-col justify-start items-start gap-5 overflow-y-auto max-h-[600px]">
                <div
                  className="prose prose-sm max-w-none text-gray-400 leading-relaxed
                    prose-headings:text-gray-400 prose-headings:font-semibold
                    prose-h1:text-2xl prose-h2:text-base prose-h3:text-base
                    prose-p:mb-3 prose-ul:my-2 prose-ol:my-2
                    prose-li:my-1 prose-a:text-primary-600 prose-a:underline
                    prose-strong:text-gray-400"
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

const AdminTermsPage: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminTermsPageContent />
  </Suspense>
);

export default AdminTermsPage;


