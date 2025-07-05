import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, Loader2, ChevronDown } from "lucide-react";
import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatData, CATEGORY_OPTIONS } from "@/lib/utils";
import ImageUploadField from "@/components/custom/ImageUploadField";
import axios from "axios";

const MAX_FILE_SIZE = 7000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  subCategory: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  author: z.string().default("n/a"),
  edition: z.string().default("n/a"),
  year: z
    .string()
    .regex(/^[0-9]{4}$/, "Enter a valid year")
    .or(z.literal(""))
    .transform((val) => val || "n/a"),
  description: z.string().default("n/a"),
  condition: z.string().default("good"),
  images: z
    .array(z.instanceof(File))
    .min(1, "At least one image is required")
    .max(3, "You can upload up to 3 images")
    .refine(
      (files) =>
        files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      "Only JPG, PNG, WebP files are supported"
    )
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      "Each image must be under 7MB"
    ),
});

const fields = ["title", "author", "edition", "year"];

const BooksForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subCategory: "",
      title: "",
      author: "",
      edition: "",
      year: "",
      description: "",
      condition: "Good",
      images: [],
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Determine the parent category based on subcategory
    const parentCategory =
      Object.entries(CATEGORY_OPTIONS).find(([key, values]) =>
        values.map((v) => v.toLowerCase()).includes(data.subCategory)
      )?.[0] || "Other";

    // For books form
    const booksProcessedData = {
      ...data,
      parentCategory: parentCategory,
      subCategory: data.subCategory,
      author: data.author.trim() || "N/A",
      edition: data.edition.trim() || "N/A",
      year: data.year.trim() || "N/A",
      condition: data.condition || "Good",
      description: data.description.trim() || "N/A",
      images: data.images,
    };

    const booksFormData = formatData(booksProcessedData);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const axiosConfig = {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    };

    try {
      // console.log(formData)
      const response = await axios.post(
        `${BACKEND_URL}/upload?category=book`,
        booksFormData,
        axiosConfig
      );

      if (response.data.success) {
        toast.success("Book donation uploaded successfully!", {
          description: `"${processedData.title}" has been added.`,
        });
        setTimeout(() => navigate("/books"), 2500);
      }
    } catch (error) {
      toast.error("Failed to submit donation", {
        description: error.response?.data?.message || "Please try again later.",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 sm:min-h-[85vh]">
      <Toaster position="bottom-right" />
      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <div className="flex items-center space-x-1 justify-center mb-6">
          <BookOpen className="text-violet-500" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Donate Books
          </h1>
        </div>

        <Card className="w-full shadow-lg border-t-4 border-t-violet-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center sm:text-2xl">
              Book Information
            </CardTitle>
            <CardDescription className="text-center">
              Please provide details about the book you'd like to donate to
              ShareSphere.
            </CardDescription>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Category Dropdown */}
                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Category*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-[hsl(224,71.4%,4.1%)] text-black dark:text-white">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[hsl(224,71.4%,4.1%)] text-black dark:text-white">
                          {Object.keys(CATEGORY_OPTIONS).map((category) => (
                            <SelectGroup key={category}>
                              <SelectLabel className="text-violet-500">
                                {category}
                              </SelectLabel>
                              {CATEGORY_OPTIONS[category].map((subcategory) => (
                                <SelectItem
                                  key={subcategory}
                                  value={subcategory.toLowerCase()}
                                >
                                  {subcategory}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Other text fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {fields.map((fieldName) => (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium capitalize">
                            {fieldName === "title"
                              ? "Title*"
                              : fieldName.charAt(0).toUpperCase() +
                                fieldName.slice(1) +
                                " (optional)"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={`Enter ${fieldName}`}
                              className="border-gray-300 focus:border-violet-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        Description (optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the book..."
                          className="resize-none min-h-[100px] border-gray-300 focus:border-violet-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Book Condition */}
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        Book Condition*
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-3">
                        {["like-new", "good", "fair"].map((cond) => (
                          <Button
                            key={cond}
                            type="button"
                            variant={
                              field.value === cond ? "default" : "outline"
                            }
                            className={
                              field.value === cond
                                ? "bg-violet-500 hover:bg-violet-600"
                                : ""
                            }
                            onClick={() => form.setValue("condition", cond)}
                          >
                            {cond
                              .replace("-", " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </Button>
                        ))}
                      </div>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <ImageUploadField
                        value={field.value || []}
                        onChange={field.onChange}
                        label="Book Images"
                        required={true}
                        error={fieldState.error?.message}
                      />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full py-6 text-base bg-violet-600 hover:bg-violet-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Donation"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default BooksForm;
