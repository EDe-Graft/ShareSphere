import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, Loader2, Upload, X } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUploadField from "@/components/ImageUploadField";
import { formatData } from "@/lib/utils";
import axios from "axios";

// Define constants for file validation
const MAX_FILE_SIZE = 7000000; // 7MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Define the form validation schema using Zod
const formSchema = z.object({
  name: z.string().min(1, "Misc. item name is required"),
  type: z.string().min(1, "Misc. item type is required"),
  brand: z.string().default("n/a"),
  color: z.string().min(1, "Misc. item color is required"),
  age: z.string().default("n/a"),
  estimatedValue: z.string().default("n/a"),
  description: z.string().min(3, "Description is required").default("misc. item"),
  condition: z.string().default("good"),
images: z
    .array(z.instanceof(File))
    .min(1, "At least one image is required")
    .max(3, "You can upload up to 3 images")
    .refine(
      (files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      "Only JPG, PNG, WebP files are supported"
    )
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      "Each image must be under 7MB"
    ),
});

const MiscellaneousForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      brand: "",
      age: "",
      color: "",
      estimatedValue: "",
      description: "",
      condition: "Good", // Default condition
      images: [],
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // For miscellaneous form
    const miscProcessedData = {
      name: data.name.trim() || "N/A",
      type: data.type.trim() || "N/A",
      brand: data.brand.trim() || "N/A",
      color: data.color.trim() || "N/A",
      age: data.age.trim() || "N/A",
      estimatedValue: data.estimatedValue.trim() || "N/A",
      description: data.description.trim() || "N/A",
      condition: formatCondition(data.condition) || "Good",
      images: data.images,
    };
    const miscFormData = formatData(miscProcessedData);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const axiosConfig = {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/upload?category=miscellaneous`,
        miscFormData,
        axiosConfig
      );

      if (response.data.success) {
        toast.success("Miscellaneous donation uploaded successfully!", {
          description: `"${processedData.type}" has been added to our donation list.`,
        });
        setTimeout(() => navigate("/miscellaneous"), 2500);
      } 
    } catch (error) {
      toast.error("Failed to submit donation", {
        description: error.response?.data?.message || "Please try again later.",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false)
        }
    }


  return (
    <main className="container mx-auto px-4 py-8 sm:min-h-[85vh]">
      {/* Sonner Toaster Component */}
      <Toaster position="bottom-right" />

      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <div className="flex items-center space-x-2 justify-center mb-6">
          <Package className="text-violet-500 h-6 w-6" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Donate Miscellaneous Items
          </h1>
        </div>

        <Card className="w-full shadow-lg border-t-4 border-t-violet-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center sm:text-2xl">
              Item Information
            </CardTitle>
            <CardDescription className="text-center">
              Please provide details about the item you'd like to donate to
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Misc. Name*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., Desk Lamp, Backpack"
                            className="border-gray-300 focus:border-violet-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-violet-500">
                              <SelectValue placeholder="Select misc. item type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="electronics">
                              Electronics
                            </SelectItem>
                            <SelectItem value="kitchen">
                              Kitchen Items
                            </SelectItem>
                            <SelectItem value="decor">Home Decor</SelectItem>
                            <SelectItem value="stationery">
                              Stationery
                            </SelectItem>
                            <SelectItem value="sports">
                              Sports Equipment
                            </SelectItem>
                            <SelectItem value="tools">Tools</SelectItem>
                            <SelectItem value="instruments">
                              Musical Instruments
                            </SelectItem>
                            <SelectItem value="art">Art Supplies</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Color*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., Black, White, Red... "
                            className="border-gray-300 focus:border-violet-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Brand (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., Sony, Apple, IKEA"
                            className="border-gray-300 focus:border-violet-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Age/How Old (optional)
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-violet-500">
                              <SelectValue placeholder="How old is the item?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="less-than-1">
                              Less than 1 year
                            </SelectItem>
                            <SelectItem value="1-2">1-2 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5+">5+ years</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                <FormField
                  control={form.control}
                  name="estimatedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        Estimated Value (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g., $20, $50-100"
                          className="border-gray-300 focus:border-violet-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                </div>                

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Description*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe the item, its features, and any other relevant details..."
                          className="resize-none min-h-[100px] border-gray-300 focus:border-violet-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        Item Condition*
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          type="button"
                          variant={
                            field.value === "like-new" ? "default" : "outline"
                          }
                          className={
                            field.value === "like-new"
                              ? "bg-violet-500 hover:bg-violet-600"
                              : ""
                          }
                          onClick={() => form.setValue("condition", "like-new")}
                        >
                          Like New
                        </Button>
                        <Button
                          type="button"
                          variant={
                            field.value === "good" ? "default" : "outline"
                          }
                          className={
                            field.value === "good"
                              ? "bg-violet-500 hover:bg-violet-600"
                              : ""
                          }
                          onClick={() => form.setValue("condition", "good")}
                        >
                          Good
                        </Button>
                        <Button
                          type="button"
                          variant={
                            field.value === "fair" ? "default" : "outline"
                          }
                          className={
                            field.value === "fair"
                              ? "bg-violet-500 hover:bg-violet-600"
                              : ""
                          }
                          onClick={() => form.setValue("condition", "fair")}
                        >
                          Fair
                        </Button>
                      </div>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <ImageUploadField field={field} fieldState={fieldState} setValue={form.setValue} />
                    </FormItem>
                  )}
                />

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

export default MiscellaneousForm;
