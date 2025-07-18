import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sofa, Loader2 } from "lucide-react";
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
import ImageUploadField from "@/components/custom/ImageUploadField";
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
  name: z.string().min(1, "Furniture name is required"),
  type: z.string().min(1, "Furniture type is required"),
  brand: z.string().optional(),
  color: z.string().min(3, "Furniture color is required"),
  age: z.string().optional(),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  description: z.string().optional(),
  condition: z.string().min(1, "Please select a condition"),
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

const FurnitureForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      color: "",
      brand: "",
      age: "",
      dimensions: "",
      material: "",
      description: "",
      condition: "",
      images: [],
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // For furniture form
    const furnitureProcessedData = {
      name: data.name.trim() || "N/A",
      type: data.type.trim() || "N/A",
      color: data.color.trim() || "N/A",
      brand: data.brand.trim() || "N/A",
      age: data.age.trim() || "N/A",
      dimensions: data.dimensions.trim() || "N/A",
      material: data.material.trim() || "N/A",
      description: data.description.trim() || "N/A",
      condition: data.condition || "N/A",
      images: data.images,
    };
    const furnitureFormData = formatData(furnitureProcessedData);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const axiosConfig = {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    };

    try {
      // console.log(formData)
      const response = await axios.post(
        `${BACKEND_URL}/upload?category=furniture`,
        furnitureFormData,
        axiosConfig
      );

      if (response.data.success) {
        toast.success("Furniture donation uploaded successfully!", {
          description: `"${furnitureProcessedData.name}" has been added to our donation list.`,
        });
        setTimeout(() => navigate("/furniture"), 2500);
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
      {/* Sonner Toaster Component */}
      <Toaster position="bottom-right" />

      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <div className="flex items-center space-x-2 justify-center mb-6">
          <Sofa className="text-violet-500 h-6 w-6" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Donate Furniture
          </h1>
        </div>

        <Card className="w-full shadow-lg border-t-4 border-t-violet-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center sm:text-2xl">
              Furniture Information
            </CardTitle>
            <CardDescription className="text-center">
              Please provide details about the furniture you'd like to donate to
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
                        <FormLabel className="font-medium">
                          Name<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., Study Desk, Bookshelf"
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
                        <FormLabel className="font-medium">
                          Type<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-violet-500">
                              <SelectValue placeholder="Select furniture type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="chair">Chair</SelectItem>
                            <SelectItem value="desk">Desk</SelectItem>
                            <SelectItem value="table">Table</SelectItem>
                            <SelectItem value="sofa">Sofa</SelectItem>
                            <SelectItem value="bed">Bed</SelectItem>
                            <SelectItem value="bookshelf">Bookshelf</SelectItem>
                            <SelectItem value="cabinet">Cabinet</SelectItem>
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
                        <FormLabel className="font-medium">
                          Color<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., black, brown, white..."
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
                            placeholder="E.g., IKEA, Ashley"
                            className="border-gray-300 focus:border-violet-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Age (optional)
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-violet-500">
                              <SelectValue placeholder="How old is the furniture?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="less-than-1">
                              Less than 1 year
                            </SelectItem>
                            <SelectItem value="1-2">1-2 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dimensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Dimensions (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., 120cm x 60cm x 75cm"
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
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Material (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., Wood, Metal, Plastic"
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
                      <FormLabel className="font-medium">
                        Description (optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the furniture, any special features, etc."
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
                        Furniture Condition{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="grid grid-cols-4 gap-3">
                        {["new", "good", "fair", "poor"].map((cond) => (
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

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <ImageUploadField
                        value={field.value || []}
                        onChange={field.onChange}
                        label="Furniture Images"
                        required={true}
                        error={fieldState.error?.message}
                      />
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

export default FurnitureForm;
