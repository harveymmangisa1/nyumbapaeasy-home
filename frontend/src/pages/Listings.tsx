import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, SlidersHorizontal, Grid3X3, List, X, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { getProperties, Property } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const activeFilters = {
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    price_type: searchParams.get("price_type") || "",
    bedrooms: searchParams.get("bedrooms") || "",
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const { properties, count, error } = await getProperties({
          category: activeFilters.category,
          search: activeFilters.search,
          price_type: activeFilters.price_type,
          bedrooms: activeFilters.bedrooms,
        });

        if (error) throw error;

        setProperties(properties);
        setTotalCount(count || 0);
      } catch (error: any) {
        toast.error("Failed to load properties: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  const clearFilter = (key: string) => {
    searchParams.delete(key);
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Search Header */}
        <div className="bg-card border-b border-border sticky top-16 z-40">
          <div className="container py-3 sm:py-4">
            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row">
              {/* Search Input */}
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location..."
                  className="pl-10"
                  value={activeFilters.search}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams);
                    if (e.target.value) {
                      params.set("search", e.target.value);
                    } else {
                      params.delete("search");
                    }
                    setSearchParams(params);
                  }}
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                <Select
                  value={activeFilters.price_type}
                  onValueChange={(value) => {
                    const params = new URLSearchParams(searchParams);
                    params.set("price_type", value);
                    setSearchParams(params);
                  }}
                >
                  <SelectTrigger className="w-28 sm:w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">For Rent</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={activeFilters.category}
                  onValueChange={(value) => {
                    const params = new URLSearchParams(searchParams);
                    params.set("category", value);
                    setSearchParams(params);
                  }}
                >
                  <SelectTrigger className="w-32 sm:w-36">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="bnb">Lodge / BnB</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={activeFilters.bedrooms}
                  onValueChange={(value) => {
                    const params = new URLSearchParams(searchParams);
                    params.set("bedrooms", value);
                    setSearchParams(params);
                  }}
                >
                  <SelectTrigger className="w-24 sm:w-32">
                    <SelectValue placeholder="Beds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bed</SelectItem>
                    <SelectItem value="2">2 Beds</SelectItem>
                    <SelectItem value="3">3 Beds</SelectItem>
                    <SelectItem value="4">4+ Beds</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  More Filters
                </Button>
              </div>

              {/* View Toggle */}
              <div className="hidden lg:flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {Object.entries(activeFilters).map(([key, value]) =>
                  value ? (
                    <Badge key={key} variant="secondary" className="gap-1">
                      {key.replace('_', ' ')}: {value}
                      <button onClick={() => clearFilter(key)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null
                )}
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching for properties...
                </span>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{totalCount}</span> properties found
                </>
              )}
            </p>
            <Select defaultValue="newest">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="featured">Featured First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Loading amazing properties...</p>
            </div>
          ) : properties.length > 0 ? (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {properties.map((property, index) => (
                <div
                  key={property.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
              <Button onClick={clearAllFilters}>Clear all filters</Button>
            </div>
          )}

          {/* Load More */}
          {!isLoading && totalCount > properties.length && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Properties
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
