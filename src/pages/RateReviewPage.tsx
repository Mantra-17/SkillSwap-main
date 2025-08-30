import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, MessageCircle, Award } from "lucide-react";

export default function RateReviewPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background p-6">
      <Card className="max-w-2xl w-full shadow-xl border-0 bg-gradient-card">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="mb-2 p-4 rounded-full bg-primary/10">
            <Star size={48} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Rate & Review</CardTitle>
          <CardDescription className="text-center text-lg text-muted-foreground">
            Build trust and reputation by rating and reviewing your swap experiences. Help others choose the best partners!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 mt-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><ThumbsUp size={18} className="mr-1" /> Rate</Badge>
              <span className="text-muted-foreground">Give a star rating after each completed swap.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><MessageCircle size={18} className="mr-1" /> Review</Badge>
              <span className="text-muted-foreground">Leave feedback to share your experience and help others.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary"><Award size={18} className="mr-1" /> Build Reputation</Badge>
              <span className="text-muted-foreground">Earn badges and recognition for positive contributions.</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <span className="text-primary font-semibold">Your feedback makes the community stronger!</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 