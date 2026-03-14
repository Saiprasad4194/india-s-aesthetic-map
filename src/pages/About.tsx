import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Scale,
  TrendingUp,
  MapPin,
  Users,
  Heart,
  Globe,
  History,
  Telescope,
  Shield,
  Zap,
  Code2,
} from "lucide-react";

const methodology = [
  {
    icon: Scale,
    title: "Legal Simplification",
    desc: "AI translates complex legal text into plain English/Hindi summaries using NLP trained on Indian legislative language.",
  },
  {
    icon: TrendingUp,
    title: "Economic Modeling",
    desc: "Estimates revenue impact, compliance costs, and job creation using sector-specific economic indicators.",
  },
  {
    icon: MapPin,
    title: "Geographic Analysis",
    desc: "Maps state-wise readiness using digital infrastructure indices, GST compliance data, and demographic factors.",
  },
  {
    icon: Users,
    title: "Community Impact",
    desc: "Identifies disproportionate effects on tribal communities, linguistic minorities, and scheduled areas.",
  },
  {
    icon: Heart,
    title: "Gender Analysis",
    desc: "Evaluates differential impacts on women-led enterprises and gender-specific policy provisions.",
  },
  {
    icon: Globe,
    title: "Global Benchmarking",
    desc: "Compares proposed laws with similar policies from other countries to predict outcomes.",
  },
  {
    icon: History,
    title: "Historical Learning",
    desc: "Analyzes past Indian reforms (GST rollout, demonetization) for lessons applicable to new legislation.",
  },
  {
    icon: Telescope,
    title: "Future Projections",
    desc: "Generates 3-year scenarios (optimistic, neutral, cautious) using Monte Carlo-inspired estimation.",
  },
];

const techStack = [
  "React + TypeScript",
  "Lovable Cloud (Backend)",
  "Lovable AI (Gemini Flash)",
  "Recharts (Visualizations)",
  "Tailwind CSS",
  "Shadcn/UI Components",
];

const About = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container py-8 space-y-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto animate-fade-in">
        <Badge className="mb-4 bg-secondary text-secondary-foreground">Academic Prototype</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          AI Parliament: Law Impact Analysis System
        </h1>
        <p className="text-lg text-muted-foreground">
          An AI-powered tool that helps Central and State Government officials understand the
          multi-dimensional impact of draft laws before they are enacted.
        </p>
      </div>

      {/* Problem & Solution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-soft border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              The Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Draft laws are complex and difficult for non-legal experts to understand</p>
            <p>• Impact assessment is often done after enactment, when it's too late</p>
            <p>• State-level and community-specific impacts are frequently overlooked</p>
            <p>• No standardized tool exists for multi-dimensional law impact analysis</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-success/20 bg-success/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-success" />
              Our Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• AI-powered analysis across 8 distinct impact modules</p>
            <p>• Role-aware views for Central vs State government perspectives</p>
            <p>• Bilingual support (English + Hindi) for wider accessibility</p>
            <p>• Visual dashboards with charts, maps, and exportable reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Methodology */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Analysis Methodology
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {methodology.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.title} className="shadow-soft card-hover">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{m.title}</h3>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {techStack.map((t) => (
              <Badge key={t} variant="secondary" className="text-sm py-1 px-3">
                {t}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          <strong>Disclaimer:</strong> This is an academic prototype built for hackathon demonstration.
          AI-generated analyses are indicative and should not be used as the sole basis for policy decisions.
        </CardContent>
      </Card>
    </main>
    <Footer />
  </div>
);

export default About;
