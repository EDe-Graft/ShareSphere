import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shirt, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  name: z.string().min(1, "Clothing name is required"),
  type: z.string().min(1, "Type of clothing is required"),
  size: z.string().min(1, "Size is required"),
  brand: z.string().optional(),
  color: z.string().min(1, "Color is required"),
  material: z.string().optional(),
  gender: z.string().min(1, "Please select a category"),
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

// Update size options based on selected type
export const getSizeOptions = (selectedType) => {
  if (selectedType === "footwear") {
    return (
      <>
        {Array.from({ length: 10 }, (_, i) => {
          const usSize = i + 5;
          const euSize = usSize * 1.5 + 30; // Approximate conversion
          return (
            <SelectItem key={usSize} value={usSize.toString()}>
              US {usSize} / EU {Math.round(euSize)}
            </SelectItem>
          );
        })}
        <SelectItem value="custom">Custom/Other</SelectItem>
      </>
    );
  } else {
    return (
      <>
        <SelectItem value="xs">XS (EU 40)</SelectItem>
        <SelectItem value="s">S (EU 42)</SelectItem>
        <SelectItem value="m">M (EU 44)</SelectItem>
        <SelectItem value="l">L (EU 48)</SelectItem>
        <SelectItem value="xl">XL (EU 52)</SelectItem>
        <SelectItem value="xxl">XXL (EU 56)</SelectItem>
        <SelectItem value="xxxl">XXXL (EU 60)</SelectItem>
        <SelectItem value="custom">Custom/Other</SelectItem>
      </>
    );
  }
};

export default function ClothingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState(""); // Track selected type
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      size: "",
      brand: "",
      color: "",
      material: "",
      gender: "",
      description: "",
      condition: "",
      images: [],
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // For clothing form
    const clothingProcessedData = {
      name: data.name.trim() || "N/A",
      type: data.type.trim() || "N/A",
      size: data.size.trim() || "N/A",
      brand: data.brand.trim() || "N/A",
      color: data.color.trim() || "N/A",
      material: data.material.trim() || "N/A",
      gender: data.gender || "N/A",
      description: data.description.trim() || "N/A",
      condition: data.condition || "N/A",
      images: data.images,
    };
    const clothingFormData = formatData(clothingProcessedData);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const axiosConfig = {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    };

    try {
      const response = await axios.post(
        `${BACKEND_URL}/upload?category=clothing`,
        clothingFormData,
        axiosConfig
      );

      if (response.data.success) {
        toast.success("Clothing donation uploaded successfully!", {
          description: `"${processedData.name}" has been added to our donation list.`,
        });
        setTimeout(() => navigate("/clothing"), 2500);
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
          <Shirt className="text-violet-500 h-6 w-6" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Donate Clothing
          </h1>
        </div>

        <Card className="w-full shadow-lg border-t-4 border-t-violet-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center sm:text-2xl">
              Clothing Information
            </CardTitle>
            <CardDescription className="text-center">
              Please provide details about the clothing you'd like to donate to
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
                        <FormLabel className="font-medium">Name*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., Winter Jacket, Denim Jeans"
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedType(value); // Update selected type
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-violet-500">
                              <SelectValue placeholder="Select clothing type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tops">Tops/Shirts</SelectItem>
                            <SelectItem value="pants">Pants/Jeans</SelectItem>
                            <SelectItem value="dresses">
                              Dresses/Skirts
                            </SelectItem>
                            <SelectItem value="outerwear">
                              Outerwear/Jackets
                            </SelectItem>
                            <SelectItem value="activewear">
                              Activewear
                            </SelectItem>
                            <SelectItem value="formal">Formal Wear</SelectItem>
                            <SelectItem value="accessories">
                              Accessories
                            </SelectItem>
                            <SelectItem value="footwear">Footwear</SelectItem>
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
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Size*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-violet-500">
                              <SelectValue
                                placeholder={
                                  selectedType === "footwear"
                                    ? "Select shoe size"
                                    : "Select size"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getSizeOptions(selectedType)}
                          </SelectContent>
                        </Select>
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
                            placeholder="E.g., Nike, H&M, Zara"
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
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Color*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., Blue, Black, Red"
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
                            placeholder="E.g., Cotton, Polyester, Denim"
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
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium">Sex*</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="mens" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Men
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="womens" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Women
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="unisex" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Unisex
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="kids" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Kids
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

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
                          placeholder="Brief description of the clothing item, any special features, etc."
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
                      <FormLabel className="font-medium">Condition*</FormLabel>
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
                        label="Clothing Images"
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
}
