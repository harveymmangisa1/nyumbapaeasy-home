import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createProperty, getCurrentUser } from "@/lib/services";

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  price_type: "month" | "sale";
  category: "residential" | "apartment" | "bnb" | "corporate" | "land" | "commercial";
  location: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  parking_spaces: string;
  amenities: string[];
  images: File[];
}

export default function AddProperty() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: "",
    price_type: "month",
    category: "residential",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    parking_spaces: "",
    amenities: [],
    images: [],
  });

  const [uploadedImagePreviews, setUploadedImagePreviews] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error("You must be logged in to add a property");
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setUploadedImagePreviews(prev => [...prev, ...newPreviews].slice(0, 8));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 8) }));
  };

  const removeImage = (index: number) => {
    setUploadedImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price || !formData.location ||
      !formData.bedrooms || !formData.bathrooms || !formData.area) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build FormData for multi-part submission
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("price_type", formData.price_type);
      data.append("category", formData.category);
      data.append("location", formData.location);
      data.append("bedrooms", formData.bedrooms);
      data.append("bathrooms", formData.bathrooms);
      data.append("area", formData.area);
      data.append("parking_spaces", formData.parking_spaces || "0");
      data.append("amenities", JSON.stringify(formData.amenities));

      // Append images
      formData.images.forEach((file) => {
        data.append("uploaded_images", file);
      });

      const { property, error } = await createProperty(data as any);

      if (error) throw error;

      toast.success("Property successfully added!", {
        icon: <CheckCircle className="h-4 w-4" />,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Failed to add property: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonAmenities = [
    "Parking", "Air Conditioning", "WiFi", "Security", "Garden",
    "Swimming Pool", "Gym", "Balcony", "Water Tank", "Backup Generator"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border"></div>
          <h1 className="font-display text-2xl font-bold text-foreground">Add New Property</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Modern 3BR Apartment in Area 47"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Area 47, Lilongwe"
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your property in detail..."
                  className="mt-1.5 min-h-[120px]"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="e.g., 850000"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label>Price Type *</Label>
                  <Select value={formData.price_type} onValueChange={(value: "month" | "sale") => handleInputChange("price_type", value)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Per Month</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value: any) => handleInputChange("category", value)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="bnb">Lodge & BnB</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                    placeholder="0"
                    className="mt-1.5"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                    placeholder="0"
                    className="mt-1.5"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area (sq.ft) *</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="1500"
                    className="mt-1.5"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="parking_spaces">Parking Spaces</Label>
                  <Input
                    id="parking_spaces"
                    type="number"
                    value={formData.parking_spaces}
                    onChange={(e) => handleInputChange("parking_spaces", e.target.value)}
                    placeholder="2"
                    className="mt-1.5"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-foreground font-medium mb-2">Click to upload images</p>
                    <p className="text-muted-foreground text-sm">PNG, JPG, JPEG up to 10MB each (Max 8 images)</p>
                  </label>
                </div>

                {/* Image Gallery */}
                {uploadedImagePreviews.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Uploaded Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      {uploadedImagePreviews.map((image, index) => (
                        <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden border">
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Custom Amenity */}
              <div className="flex gap-3">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add custom amenity"
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                />
                <Button type="button" onClick={addAmenity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Common Amenities */}
              <div>
                <Label className="text-sm font-medium">Common Amenities</Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {commonAmenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (formData.amenities.includes(amenity)) {
                          removeAmenity(amenity);
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            amenities: [...prev.amenities, amenity]
                          }));
                        }
                      }}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Selected Amenities */}
              {formData.amenities.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Selected Amenities</Label>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="gap-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Publish Property
                  <Plus className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
