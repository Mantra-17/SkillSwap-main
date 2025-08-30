import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, MapPin, Star } from "lucide-react";

export default function FindSkillsPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background p-6">
      <Card className="max-w-2xl w-full shadow-xl border-0 bg-gradient-card">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="mb-2 p-4 rounded-full bg-primary/10">
            <Users size={48} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Find Skills</CardTitle>
          <CardDescription className="text-center text-lg text-muted-foreground">
            Discover a world of skills offered by our vibrant community. Easily search, filter, and connect with people who have the expertise you need.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><Search size={18} className="mr-1" /> Search</Badge>
              <span className="text-muted-foreground">Use the search bar to find specific skills or browse categories.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><MapPin size={18} className="mr-1" /> Filter</Badge>
              <span className="text-muted-foreground">Filter by location, skill level, or availability to find the perfect match.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><Star size={18} className="mr-1" /> Explore</Badge>
              <span className="text-muted-foreground">Check out user profiles, ratings, and reviews before connecting.</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <span className="text-primary font-semibold">Ready to learn something new? Start browsing now!</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 