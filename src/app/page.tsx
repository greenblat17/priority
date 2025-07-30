import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, Clock, Target, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Transform Feedback into{" "}
              <span className="text-primary">Prioritized Action</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              AI-powered task management designed for solo founders. 
              Save 5-10 hours per week by automatically prioritizing what matters most.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/login?mode=signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for Solo Founders, by Solo Founders
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatically categorize and prioritize tasks based on business impact
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Smart Prioritization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  1-10 priority scoring that adapts to your business stage and goals
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Save 5-10 Hours/Week</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Stop second-guessing priorities. Focus on execution, not planning
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Implementation Specs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get AI-generated specs ready for coding tools like Cursor or Claude
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Ship Faster?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join solo founders who are building smarter, not harder. 
            Start prioritizing what truly moves the needle.
          </p>
          <Button asChild size="lg">
            <Link href="/auth/login?mode=signup">
              Start Free Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}