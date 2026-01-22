import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Save,
  X,
  Camera,
  User,
  Mail,
  MapPin,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth, getAxiosConfig } from "@/components/context/AuthContext";
import axios from "axios";

const EditProfilePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    photo: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const location = useLocation();
  const passedProfileData = location.state?.profileData;
  const returnPath = location.state?.returnTo || `/profile/${user?.userId}`;

  useEffect(() => {
    if (passedProfileData) {
      // Use data passed from ProfilePage
      setProfileData({
        name: passedProfileData.name || passedProfileData.displayName || "",
        username: passedProfileData.username || "",
        email: passedProfileData.email || "",
        bio: passedProfileData.bio || "",
        location: passedProfileData.location || "",
        photo: passedProfileData.photo || "",
        photoPublicId: passedProfileData.photoPublicId || null,
      });
      setPhotoPreview(passedProfileData.photo || "");
      setIsLoading(false);
    } else if (user) {
      // Fallback to API call if no data passed
      loadProfileData();
    }
  }, [user, passedProfileData]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);

      // Load current user profile data
      const response = await axios.get(
        `${BACKEND_URL}/user-profile/${user.userId}`,
        getAxiosConfig()
      );

      if (response.data.getSuccess) {
        const userData = response.data.userData;
        setProfileData({
          name: userData.name || userData.displayName || "N/A",
          username: userData.username || "N/A",
          email: userData.email || "N/A",
          bio: userData.bio || "N/A",
          location: userData.location || "N/A",
          photo: userData.photo || "N/A",
        });
        setPhotoPreview(userData.photo || "N/A");
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    console.log("Photo change triggered");
    const file = e.target.files?.[0];
    console.log("Selected file:", file);

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setPhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!profileData.name.trim()) {
        toast.error("Name is required");
        return;
      }

      if (!profileData.username.trim()) {
        toast.error("Username is required");
        return;
      }

      if (!profileData.email.trim()) {
        toast.error("Email is required");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const formData = new FormData();

      //append data fields to Form Data
      for (const [key, value] of Object.entries(profileData)) {
        //only append fields that changed and are defined or non empty
        if (profileData[key] && profileData[key] !== passedProfileData[key]) {
          formData.append(key, value);
        }
      }

      // append photo if changed
      if (photoFile) {
        formData.append("profilePhoto", photoFile);
      }

      //send patch request to backend
      const config = getAxiosConfig();
      const updateResponse = await axios.patch(
        `${BACKEND_URL}/update-profile`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            ...(config.headers.Authorization && { Authorization: config.headers.Authorization })
          },
          withCredentials: false,
        }
      );

      if (updateResponse.data.success) {
        toast.success("Profile updated successfully!");

        const updateData = updateResponse.data.userData;

        // Update user context if available
        if (setUser) {
          setUser({
            ...user,
            ...updateData,
          });
        }

        // Navigate back to profile
        setTimeout(() => {
          navigate(returnPath);
        }, 1500);
      } else {
        throw new Error(
          updateResponse.data.message || "Failed to update profile"
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response?.status === 409) {
        toast.error("Username or email already exists");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(returnPath);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-muted rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-10 w-full bg-muted rounded animate-pulse" />
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <p className="text-muted-foreground">
                Update your profile information
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={photoPreview || "/placeholder.svg?height=80&width=80"}
                    alt="Profile photo"
                  />
                  <AvatarFallback className="text-lg">
                    {profileData.name.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 z-10 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              <div>
                <p className="font-medium">Profile Photo</p>
                <p className="text-sm text-muted-foreground">
                  Click the camera icon to upload a new photo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: 5MB. Supported: JPG, PNG, GIF
                </p>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  <User className="h-4 w-4 inline mr-2" />
                  Username *
                </Label>
                <Input
                  id="username"
                  value={profileData.username.slice(1)}
                  onChange={(e) =>
                    handleInputChange(
                      "username",
                      e.target.value.toLowerCase().replace(/\s/g, "")
                    )
                  }
                  placeholder="Enter your username"
                  maxLength={30}
                />
                <p className="text-xs text-muted-foreground">
                  Username will be converted to lowercase without spaces
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="h-4 w-4 inline mr-2" />
                Location
              </Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, State or Country"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">
                <FileText className="h-4 w-4 inline mr-2" />
                Bio
              </Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell others about yourself..."
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {profileData.bio.length}/500 characters
              </p>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default EditProfilePage;
