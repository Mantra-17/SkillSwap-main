import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Handshake,
  MapPin,
  BookOpen,
  Star,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Brand } from "@/components/Brand";

const fallbackSkills = [
  "Product Design",
  "Frontend Engineering",
  "Photography",
  "Spanish",
  "Brand Strategy",
  "Fitness Coaching",
  "Copywriting",
  "Data Analysis",
  "Public Speaking",
  "Guitar",
];

type SkillRow = {
  name: string;
  category: string | null;
};

type FeaturedProfile = {
  id: string;
  name: string;
  location: string | null;
  profile_photo: string | null;
  rating: number | null;
  bio: string | null;
};

export default function HomePage() {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [featured, setFeatured] = useState<FeaturedProfile[]>([]);
  const [stats, setStats] = useState({
    members: 0,
    skills: 0,
    swaps: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [skillsResult, profilesResult, skillsCount, membersCount, swapsCount] =
          await Promise.all([
            supabase
              .from("skills")
              .select("name, category")
              .order("name", { ascending: true })
              .limit(10),
            supabase
              .from("profiles")
              .select("id, name, location, profile_photo, rating, bio")
              .eq("is_public", true)
              .order("rating", { ascending: false })
              .limit(3),
            supabase.from("skills").select("id", { count: "exact", head: true }),
            supabase
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .eq("is_public", true),
            supabase
              .from("swap_requests")
              .select("id", { count: "exact", head: true })
              .eq("status", "completed"),
          ]);

        if (!isMounted) return;

        if (!skillsResult.error && skillsResult.data) {
          setSkills(skillsResult.data);
        }

        if (!profilesResult.error && profilesResult.data) {
          setFeatured(profilesResult.data as FeaturedProfile[]);
        }

        setStats({
          members: membersCount.count || 0,
          skills: skillsCount.count || 0,
          swaps: swapsCount.count || 0,
        });
      } catch (error) {
        console.error("HomePage data load failed", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const displaySkills = useMemo(() => {
    if (skills.length > 0) return skills.map((skill) => skill.name);
    return fallbackSkills;
  }, [skills]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 bg-hero-grid" aria-hidden="true" />
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <Badge className="w-fit border border-foreground/10 bg-background text-foreground">
                Skill swaps built for real communities
              </Badge>
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">
                  Trade knowledge. Build momentum. Keep it human.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                  SkillSwap pairs people who want to learn with people who love to teach. Find a
                  swap partner, agree on a plan, and grow your community one lesson at a time.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group" asChild>
                  <Link to="/browse">
                    Browse Skills
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/signin">Create Your Profile</Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-6 rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-soft">
                <div>
                  <p className="text-2xl font-semibold">
                    {loading ? "--" : stats.members.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Active members</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {loading ? "--" : stats.skills.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Skills listed</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {loading ? "--" : stats.swaps.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Swaps completed</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-foreground/10 bg-background/90 shadow-hover">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Swap Match Preview</CardTitle>
                    <Badge variant="secondary" className="rounded-full">Live</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The fastest way to see who can help you and what you can offer back.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-xl border border-foreground/10 bg-muted/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">You teach</p>
                        <p className="text-lg font-semibold">UI Design Foundations</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          Weeknights or Saturday mornings
                        </div>
                      </div>
                      <Badge variant="outline">Offer</Badge>
                    </div>
                  </div>
                  <div className="rounded-xl border border-foreground/10 bg-muted/30 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">You want</p>
                        <p className="text-lg font-semibold">Conversational Spanish</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          Remote or in-person meetups
                        </div>
                      </div>
                      <Badge variant="secondary">Request</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-foreground/10 bg-background p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" />
                        <AvatarFallback>MT</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Marina Torres</p>
                        <p className="text-xs text-muted-foreground">Spanish • 4.9 rating</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/request-swaps">Connect</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-foreground/10 bg-background/80 p-5 shadow-soft">
                  <Sparkles className="h-6 w-6 text-secondary" />
                  <h3 className="mt-4 text-lg font-semibold">Smart matching</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Match based on location, schedule, and the skills you care about.
                  </p>
                </div>
                <div className="rounded-2xl border border-foreground/10 bg-background/80 p-5 shadow-soft">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">Trusted community</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Verified profiles, ratings, and clear swap expectations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-display">How SkillSwap Works</h2>
              <p className="text-muted-foreground max-w-2xl">
                Designed for real exchanges, not random chats. Set expectations, confirm the swap,
                then show up ready to learn.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/find-skills">Find a skill match</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card className="border-foreground/10 bg-background">
              <CardHeader>
                <Handshake className="h-7 w-7 text-primary" />
                <CardTitle className="text-xl">1. Offer & request</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Create a profile that highlights what you can teach and what you want to learn.
              </CardContent>
            </Card>
            <Card className="border-foreground/10 bg-background">
              <CardHeader>
                <BookOpen className="h-7 w-7 text-secondary" />
                <CardTitle className="text-xl">2. Plan the swap</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Compare availability, decide on goals, and set the first session date.
              </CardContent>
            </Card>
            <Card className="border-foreground/10 bg-background">
              <CardHeader>
                <Sparkles className="h-7 w-7 text-foreground" />
                <CardTitle className="text-xl">3. Learn together</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Swap sessions, share feedback, and keep your momentum going.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-display">Trending skills right now</h2>
              <p className="text-muted-foreground max-w-2xl">
                Real skills being offered in the community. New entries appear as members join.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/browse">Browse the full list</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {displaySkills.map((skill, index) => (
              <Badge
                key={`${skill}-${index}`}
                variant="secondary"
                className="rounded-full border border-foreground/10 bg-background px-4 py-2 text-sm transition hover:-translate-y-0.5"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-display">Meet the people behind the skills</h2>
              <p className="text-muted-foreground max-w-2xl">
                Featured community members who consistently deliver meaningful, high-quality swaps.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/profile">Explore community</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {(featured.length > 0 ? featured : Array.from({ length: 3 })).map((profile, index) => {
              if (!profile || typeof profile === "number") {
                return (
                  <Card key={`placeholder-${index}`} className="border-foreground/10 bg-background">
                    <CardHeader className="space-y-3">
                      <div className="h-12 w-12 rounded-full bg-muted" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded bg-muted" />
                        <div className="h-3 w-24 rounded bg-muted" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-3 w-full rounded bg-muted" />
                      <div className="h-3 w-5/6 rounded bg-muted" />
                    </CardContent>
                  </Card>
                );
              }

              const initials = profile.name
                .split(" ")
                .map((segment) => segment[0])
                .join("")
                .slice(0, 2);

              return (
                <Card key={profile.id} className="border-foreground/10 bg-background">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.profile_photo || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {profile.location || "Remote"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-amber-500" />
                      {profile.rating ? profile.rating.toFixed(1) : "New"} rating
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {profile.bio ||
                      "Focused on practical sessions and a supportive, step-by-step learning pace."}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-display">Ready to trade skills?</h2>
              <p className="text-lg text-background/80">
                Build a profile, list your strengths, and start swapping with people who are ready to
                learn from you.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signin">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/browse">Explore Skills</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-foreground/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <Brand size="sm" />
            <p className="text-sm text-muted-foreground">
              Crafted for local exchanges and long-term learning relationships.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
