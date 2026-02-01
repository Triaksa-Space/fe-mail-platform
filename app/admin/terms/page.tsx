"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { FileText, Save, Loader2, Eye, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminContentCard from "@/components/admin/AdminContentCard";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";

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
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
  const [effectiveDate, setEffectiveDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState<string>("");

  // Auth check
  useEffect(() => {
    setAuthLoaded(true);
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

  // Save terms content
  const handleSave = async () => {
    if (!token) return;

    try {
      setIsSaving(true);
      await apiClient.put("/admin/content/terms", {
        content: content,
        effective_date: effectiveDate,
      });

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
      <div className="flex flex-col gap-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Terms of Services
              </h1>
              <p className="text-sm text-gray-500">
                Manage the Terms of Services content displayed to users
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2"
            >
              {isPreview ? (
                <>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className={cn(
                "flex items-center gap-2",
                isSaving || isLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Effective Date */}
        <AdminContentCard>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Effective Date
            </label>
            <Input
              type="text"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              placeholder="e.g., January 1, 2024"
              className="max-w-xs h-11 rounded-xl border-gray-200"
            />
          </div>
        </AdminContentCard>

        {/* Content Editor / Preview */}
        <AdminContentCard title={isPreview ? "Preview" : "Content Editor"}>
          {isLoading ? (
            <LoadingFallback />
          ) : isPreview ? (
            <div
              className="prose prose-sm max-w-none text-gray-600 leading-relaxed
                prose-headings:text-gray-900 prose-headings:font-semibold
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:mb-3 prose-ul:my-2 prose-ol:my-2
                prose-li:my-1 prose-a:text-blue-600 prose-a:hover:text-blue-700
                prose-strong:text-gray-900 prose-blockquote:border-l-blue-500
                prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4
                min-h-[400px] p-4 border border-gray-200 rounded-xl"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          ) : (
            <div className="min-h-[400px]">
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                onInit={(_evt: unknown, editor: TinyMCEEditor) => {
                  editorRef.current = editor;
                  setEditorReady(true);
                }}
                value={content}
                onEditorChange={(newContent: string) => setContent(newContent)}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    "advlist", "autolink", "lists", "link", "charmap", "preview",
                    "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                    "insertdatetime", "table", "code", "help", "wordcount"
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic underline strikethrough | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "link | removeformat | help",
                  content_style:
                    "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #4B5563; }",
                  branding: false,
                  promotion: false,
                }}
              />
              {!editorReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
            </div>
          )}
        </AdminContentCard>
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
