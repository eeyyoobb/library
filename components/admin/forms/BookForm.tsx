"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X, Plus, BookOpen, Layers, Tag, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

// Interactive Tag Input Component for Array Fields
function TagInput({
  value = [],
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/^,|,$/g, "");
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((tag, idx) => (
          <Badge
            key={idx}
            variant="secondary"
            className="flex items-center gap-1.5 px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full transition-all"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-slate-400 hover:text-slate-700 focus:outline-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-slate-50/50 border-slate-200 focus:bg-white"
      />
    </div>
  );
}

const BookForm = ({ type = "create", ...book }: Props) => {
  const router = useRouter();

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      coverColor: (book as any).coverColor ?? "#000000",
      summary: (book as any).summary ?? "",
    },
  });

  const translated = form.watch("translated");

  const onSubmit = async (values: BookFormValues) => {
    if (type === "update") {
      toast({
        title: "Not implemented",
        description:
          "Package replacement should be handled separately for updates.",
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
        description: "Please select the book PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (values.translated && !values.translator?.trim()) {
      toast({
        title: "Translator required",
        description: "Please enter the translator name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

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
          ? { translator: values.translator?.trim() ?? "" }
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
        description: "Book package uploaded and created successfully.",
      });

      router.push("/dashboard");
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-5xl space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
      >
        {/* Section 1: Basic Overview */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">Basic Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Book Title
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Purpose Driven Life" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Author
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Rick Warren" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Translation Checkbox & Translator Field */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
            <FormField
              control={form.control}
              name="translated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-slate-700 cursor-pointer">
                    This book is translated from another language
                  </FormLabel>
                </FormItem>
              )}
            />

            {translated && (
              <FormField
                control={form.control}
                name="translator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-slate-700">
                      Translator Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter translator's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Section 2: Classification */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
            <Layers className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">Classification & Audience</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Category
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Subcategory
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Interpretation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Genre
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Spiritual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Language
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Target Audience
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AUDIENCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tradition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Tradition
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tradition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRADITION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section 3: Tags & Metadata */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
            <Tag className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">Keywords & Content</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Keywords Array
                  </FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Type keyword and press Enter..."
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Press Enter or comma to create array items.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Topics Array
                  </FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Type topic and press Enter..."
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Press Enter or comma to create array items.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Initial Rating (0-5)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-slate-700">
                    Primary Theme Color
                  </FormLabel>
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
          </div>

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-slate-700">
                  Short Summary
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief overview of the main takeaways..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-slate-700">
                  Full Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section 4: File Uploads */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
            <Upload className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">Media & Asset Package</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormItem className="rounded-xl border border-dashed border-slate-200 p-4 bg-slate-50/50">
              <FormLabel className="font-medium text-slate-700">
                Book Cover Image
              </FormLabel>
              <FileUpload
                type="image"
                accept="image/*"
                placeholder="Upload cover image"
                variant="light"
                onFileSelect={setCoverFile}
              />
              {!coverFile && (
                <p className="mt-2 text-xs text-rose-500 font-medium">
                  Cover image required.
                </p>
              )}
            </FormItem>

            <FormItem className="rounded-xl border border-dashed border-slate-200 p-4 bg-slate-50/50">
              <FormLabel className="font-medium text-slate-700">
                Book PDF Document
              </FormLabel>
              <PdfUpload
                type="pdf"
                accept="application/pdf"
                placeholder="Upload PDF document"
                variant="light"
                onFileSelect={setPdfFile}
              />
              {!pdfFile && (
                <p className="mt-2 text-xs text-rose-500 font-medium">
                  PDF file required.
                </p>
              )}
            </FormItem>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !coverFile || !pdfFile}
          className="w-full bg-slate-900 py-6 text-base font-medium hover:bg-slate-800 text-white rounded-xl shadow-md transition-all"
        >
          {isSubmitting
            ? "Generating Package & Creating..."
            : "Publish Book to Library"}
        </Button>
      </form>
    </Form>
  );
};

export default BookForm;
