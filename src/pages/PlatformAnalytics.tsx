import { useSeo } from "@/hooks/useSeo";

export default function PlatformAnalytics() {
  useSeo({
    title: "Platform Analytics",
    description: "Track growth, engagement, and platform health.",
    noindex: true,
  });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Platform Analytics</h1>
      <p className="text-muted-foreground mb-8">View key metrics, growth charts, and engagement statistics.</p>
      {/* TODO: Implement analytics dashboard */}
    </div>
  );
}
