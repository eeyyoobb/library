"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

import { bookSchema } from "@/lib/validations";
import { createBook } from "@/lib/admin/actions/book";

import FileUpload from "@/components/FileUpload";
import ColorPicker from "@/components/admin/ColorPicker";

import { toast } from "@/hooks/use-toast";
import PdfUpload from "@/components/pdfUpload";

interface Props extends Partial<Book> {
  type?: "create" | "update";
}

type BookFormValues = z.infer<typeof bookSchema>;

const CATEGORY_OPTIONS = [
  { value: "bible-study", label: "Bible Study" },
  { value: "theology", label: "Theology" },
  { value: "devotional", label: "Devotional" },
  { value: "christian-living", label: "Christian Living" },
  { value: "prayer", label: "Prayer" },
  { value: "sermon", label: "Sermon" },
  { value: "commentary", label: "Commentary" },
  { value: "apologetics", label: "Apologetics" },
  { value: "church-history", label: "Church History" },
  { value: "biography", label: "Biography" },
  { value: "discipleship", label: "Discipleship" },
  { value: "family", label: "Family" },
  { value: "youth", label: "Youth" },
  { value: "children", label: "Children" },
  { value: "missions", label: "Missions" },
  { value: "leadership", label: "Leadership" },
  { value: "prophecy", label: "Prophecy" },
  { value: "other", label: "Other" },
];

const LANGUAGE_OPTIONS = [
  { value: "am", label: "Amharic" },
  { value: "en", label: "English" },
  { value: "om", label: "Afaan Oromo" },
  { value: "ti", label: "Tigrinya" },
  { value: "aa", label: "Afar" },
  { value: "so", label: "Somali" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "other", label: "Other" },
];

const AUDIENCE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "children", label: "Children" },
  { value: "youth", label: "Youth" },
  { value: "adults", label: "Adults" },
  { value: "leaders", label: "Church Leaders" },
  { value: "students", label: "Students" },
];

const TRADITION_OPTIONS = [
  { value: "christian", label: "Christian" },
  { value: "protestant", label: "Protestant" },
  { value: "orthodox", label: "Orthodox" },
  { value: "catholic", label: "Catholic" },
  { value: "evangelical", label: "Evangelical" },
  { value: "other", label: "Other" },
];

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const BookForm = ({ type = "create", ...book }: Props) => {
  const router = useRouter();

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Generate the ID only once for this form instance.
   */
  const [bookId] = useState(() => crypto.randomUUID());

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book.title ?? "",
      description: book.description ?? "",
      author: book.author ?? "",
      genre: book.genre ?? "spiritual",
      category: (book as any).category ?? "other",
      subcategory: (book as any).subcategory ?? "",
      language: (book as any).language ?? "am",
      translated: (book as any).translated ?? false,
      translator: (book as any).translator ?? "",
      rating: (book as any).rating ?? 1,
      keywords: (book as any).keywords ?? [],
      topics: (book as any).topics ?? [],
      audience: (book as any).audience ?? "general",
      tradition: (book as any).tradition ?? "christian",
      coverColor: (book as any).coverColor ?? "",
      summary: (book as any).summary ?? "",
    },
  });

  const translated = form.watch("translated");

  const onSubmit = async (values: BookFormValues) => {
    if (type === "update") {
      toast({
        title: "Not implemented",
        description:
          "Package replacement should be handled separately for book updates.",
      });

      return;
    }

    if (!coverFile) {
      toast({
        title: "Cover image required",
        description: "Please select a cover image.",
        variant: "destructive",
      });

      return;
    }

    if (!pdfFile) {
      toast({
        title: "PDF required",
        description: "Please select the book PDF.",
        variant: "destructive",
      });

      return;
    }

    if (values.translated && !values.translator?.trim()) {
      toast({
        title: "Translator required",
        description: "Please enter the translator when the book is translated.",
        variant: "destructive",
      });

      return;
    }

    try {
      setIsSubmitting(true);

      /**
       * This is the manifest that will be placed
       * inside the ZIP.
       */
      const manifest = {
        schemaVersion: 1,

        id: bookId,

        title: values.title.trim(),
        description: values.description?.trim() ?? "",
        author: values.author.trim(),

        genre: values.genre?.trim() || "spiritual",

        category: values.category,
        subcategory: values.subcategory?.trim() ?? "",

        language: values.language,

        translated: values.translated,

        ...(values.translated
          ? {
              translator: values.translator?.trim() ?? "",
            }
          : {}),

        rating: Number(values.rating),

        keywords: values.keywords ?? [],
        topics: values.topics ?? [],

        audience: values.audience,
        tradition: values.tradition,

        summary: values.summary?.trim() ?? "",

        coverColor: values.coverColor ?? "",

        files: {
          cover: "cover.jpg",
          pdf: "book.pdf",
        },
      };

      console.log("[BOOK] Manifest:", manifest);

      /**
       * Send metadata + actual files to Next.js.
       */
      const formData = new FormData();

      formData.append("id", bookId);
      formData.append("manifest", JSON.stringify(manifest));

      formData.append("cover", coverFile);
      formData.append("pdf", pdfFile);

      const response = await fetch("/api/pdf/upload", {
        method: "POST",
        body: formData,
      });

      const packageResult = await response.json();

      if (!response.ok) {
        throw new Error(packageResult.error || "Failed to create book package");
      }

      /**
       * Save database record only after
       * the ZIP was successfully uploaded.
       */
      const result = await createBook({
        ...values,
        id: bookId,
        coverUrl: packageResult.coverUrl,
        packageUrl: packageResult.packageUrl,
      } as any);

      if (!result.success) {
        throw new Error(result.message || "Failed to create book");
      }

      toast({
        title: "Success",
        description: "Book package uploaded and book created successfully.",
      });

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("[BOOK] Creation failed:", error);

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create book",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* TITLE */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Book Title</FormLabel>

              <FormControl>
                <Input
                  required
                  placeholder="Book title"
                  {...field}
                  className="book-form_input"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* AUTHOR */}
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>

              <FormControl>
                <Input
                  required
                  placeholder="Book author"
                  {...field}
                  className="book-form_input"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* LANGUAGE */}
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>

              <FormControl>
                <select {...field} className="book-form_input">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* TRANSLATED */}
        <FormField
          control={form.control}
          name="translated"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>

                <FormLabel>This book is translated</FormLabel>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* TRANSLATOR */}
        {translated && (
          <FormField
            control={form.control}
            name="translator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Translator</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Translator name"
                    {...field}
                    className="book-form_input"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* CATEGORY */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>

              <FormControl>
                <select {...field} className="book-form_input">
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* SUBCATEGORY */}
        <FormField
          control={form.control}
          name="subcategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subcategory</FormLabel>

              <FormControl>
                <Input
                  placeholder="e.g. Bible Interpretation"
                  {...field}
                  className="book-form_input"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* GENRE */}
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>

              <FormControl>
                <Input
                  placeholder="e.g. Spiritual, Biography"
                  {...field}
                  className="book-form_input"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* AUDIENCE */}
        <FormField
          control={form.control}
          name="audience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audience</FormLabel>

              <FormControl>
                <select {...field} className="book-form_input">
                  {AUDIENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* TRADITION */}
        <FormField
          control={form.control}
          name="tradition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Christian Tradition</FormLabel>

              <FormControl>
                <select {...field} className="book-form_input">
                  {TRADITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* RATING */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>

              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="book-form_input"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* KEYWORDS */}
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>

              <FormControl>
                <Input
                  placeholder="faith, prayer, bible, grace"
                  value={field.value?.join(", ") ?? ""}
                  onChange={(e) => field.onChange(parseList(e.target.value))}
                  className="book-form_input"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* TOPICS */}
        <FormField
          control={form.control}
          name="topics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topics</FormLabel>

              <FormControl>
                <Input
                  placeholder="Faith, Prayer, Salvation"
                  value={field.value?.join(", ") ?? ""}
                  onChange={(e) => field.onChange(parseList(e.target.value))}
                  className="book-form_input"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* COVER */}
        <FormItem>
          <FormLabel>Book Cover</FormLabel>

          <FileUpload
            type="image"
            accept="image/*"
            placeholder="Upload a book cover"
            variant="light"
            onFileSelect={setCoverFile}
          />

          {!coverFile && (
            <p className="text-sm text-red-500">Cover image is required.</p>
          )}
        </FormItem>

        {/* COVER COLOR */}
        <FormField
          control={form.control}
          name="coverColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>

              <FormControl>
                <ColorPicker
                  onPickerChange={field.onChange}
                  value={field.value}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* DESCRIPTION */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Book Description</FormLabel>

              <FormControl>
                <Textarea
                  placeholder="Book description"
                  {...field}
                  rows={8}
                  className="book-form_input"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* SUMMARY */}
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Book Summary</FormLabel>

              <FormControl>
                <Textarea
                  placeholder="Short summary"
                  {...field}
                  rows={5}
                  className="book-form_input"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* PDF */}
        <FormItem>
          <FormLabel>Book PDF</FormLabel>

          <PdfUpload
            type="pdf"
            accept="application/pdf"
            placeholder="Upload a PDF file"
            variant="light"
            onFileSelect={setPdfFile}
          />

          {!pdfFile && <p className="text-sm text-red-500">PDF is required.</p>}
        </FormItem>

        {/* SUBMIT */}
        <Button
          type="submit"
          disabled={isSubmitting || !coverFile || !pdfFile}
          className="book-form_btn text-white"
        >
          {isSubmitting ? "Creating Book Package..." : "Add Book to Library"}
        </Button>
      </form>
    </Form>
  );
};

export default BookForm;
