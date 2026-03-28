"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "../../../sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import { 
  FileText, 
  Linkedin, 
  MessageSquare, 
  ArrowRight, 
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import SanityImage from "@/components/SanityImage";

interface Guide {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  mainImage?: any;
  category: string;
  duration: string;
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGuides() {
      try {
        const data = await client.fetch(`*[_type == "guide"]`);
        setGuides(data);
      } catch (error) {
        console.error("Failed to fetch guides:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGuides();
  }, []);

  const builder = createImageUrlBuilder(client);
  function urlFor(source: any) {
    return builder.image(source);
  }

  const categoryMapping = {
    'resume-mastery': {
      title: "Resume Mastery",
      icon: <FileText className="h-6 w-6" />,
      color: "blue"
    },
    'linkedin-networking': {
      title: "LinkedIn & Networking",
      icon: <Linkedin className="h-6 w-6" />,
      color: "indigo"
    },
    'interview-success': {
      title: "Interview Success",
      icon: <MessageSquare className="h-6 w-6" />,
      color: "purple"
    }
  };

  const dynamicCategories = Object.entries(categoryMapping).map(([key, config]) => {
    const categoryGuides = guides.filter(g => g.category === key);
    return {
      ...config,
      description: categoryGuides.length > 0 ? "Expert guides in " + config.title : "Coming soon: " + config.title,
      items: categoryGuides.map(g => g.title).slice(0, 3),
      slug: key
    };
  });

  // Use dynamic categories if guides are loaded, otherwise use static (as fallback)
  const displayCategories = guides.length > 0 ? dynamicCategories : [
    {
      title: "Resume Mastery",
      icon: <FileText className="h-6 w-6" />,
      description: "Build an ATS-proof resume that highlights your true value and beats the algorithms.",
      items: ["2024 ATS Algorithm Secrets", "Keyword Optimization Guide", "Action Verbs for Impact"],
      color: "blue"
    },
    // ... we can keep the static ones if needed, but for now I'll just use dynamicCategories if guides exist
  ];

  // If we have guides, we use dynamicCategories. If not, we use the original ones.
  const categories = guides.length > 0 ? dynamicCategories : [
    {
      title: "Resume Mastery",
      icon: <FileText className="h-6 w-6" />,
      description: "Build an ATS-proof resume that highlights your true value and beats the algorithms.",
      items: ["2024 ATS Algorithm Secrets", "Keyword Optimization Guide", "Action Verbs for Impact"],
      color: "blue"
    },
    {
      title: "LinkedIn & Networking",
      icon: <Linkedin className="h-6 w-6" />,
      description: "Turn your profile into a magnetic lead-gen tool and master the art of networking.",
      items: ["Headline Best Practices", "Compelling 'About' Sections", "Networking Templates"],
      color: "indigo"
    },
    {
      title: "Interview Success",
      icon: <MessageSquare className="h-6 w-6" />,
      color: "purple",
      description: "Go beyond basic answers with our expert-backed behavioral interview techniques.",
      items: ["STAR Method Deep Dive", "Common Behavioral Questions", "Company Research Tips"],
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Simple Hero Section */}
      <section className="py-20 bg-zinc-50 border-b border-zinc-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Career Acceleration Resource
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl mb-6">
            The Ultimate Career Library
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Expert-backed strategies and actionable resources designed to help you navigate 
            every stage of your job search journey with confidence.
          </p>
          
          {/* Static Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search for guides (e.g., 'ATS keywords', 'STAR method')..."
              className="block w-full pl-11 pr-4 py-4 border border-zinc-200 rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <div key={idx} className="p-8 rounded-3xl border border-zinc-100 bg-white hover:shadow-xl transition-shadow flex flex-col h-full">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-${cat.color}-50 text-${cat.color}-600`}>
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">{cat.title}</h3>
                <p className="text-zinc-600 mb-8 grow">
                  {cat.description}
                </p>
                
                <div className="space-y-4 mb-8">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-700 font-medium">
                      <CheckCircle2 className={`h-4 w-4 text-${cat.color}-500`} />
                      {item}
                    </div>
                  ))}
                </div>
                
                <Link 
                  href="#" 
                  className={`mt-auto inline-flex items-center gap-2 font-bold text-${cat.color}-600 hover:gap-3 transition-all`}
                >
                  Explore Category <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides Section */}
      <section className="py-24 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Most Popular Guides</h2>
              <p className="text-zinc-600">The most read resources by our community of graduates.</p>
            </div>
            <Link href="/blog" className="text-sm font-bold text-blue-600 hover:underline">View all resources</Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {guides.length > 0 ? (
              guides.slice(0, 2).map((guide) => (
                <GuideCard 
                  key={guide._id}
                  image={guide.mainImage ? urlFor(guide.mainImage).url() : "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800"}
                  category={guide.category}
                  title={guide.title}
                  duration={guide.duration || "5 min read"}
                  slug={guide.slug.current}
                />
              ))
            ) : (
              <>
                <GuideCard 
                  image="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800"
                  category="Resume Prep"
                  title="The 10-Second Rule: How Recruiters Scan Resumes"
                  duration="8 min read"
                />
                <GuideCard 
                  image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
                  category="Interview Prep"
                  title="Mastering the STAR Method for Behavioral Interviews"
                  duration="12 min read"
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-zinc-900 px-8 py-20 text-center text-white sm:px-16">
            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold mb-6">
              Ready to land your dream job?
            </h2>
            <p className="mx-auto max-w-xl text-lg text-zinc-400 mb-10 leading-relaxed">
              Use our AI-powered analyzer to see how your resume stacks up against industry standards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/analyze"
                className="w-full sm:w-auto rounded-xl bg-white px-10 py-4 text-base font-bold text-zinc-900 shadow-xl hover:bg-zinc-100 transition-all active:scale-95"
              >
                Analyze My Resume
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GuideCard({ image, category, title, duration, slug }: { image: string, category: string, title: string, duration: string, slug?: string }) {
  return (
    <Link href={slug ? `/guides/${slug}` : "#"} className="group flex flex-col md:flex-row gap-6 p-4 rounded-3xl border border-zinc-100 bg-white hover:border-blue-100 hover:shadow-lg transition-all">
      <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shrink-0">
        <SanityImage 
          image={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
      </div>
      <div className="flex flex-col justify-center py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{category}</span>
          <span className="text-xs text-zinc-400 font-bold flex items-center gap-1.5 border-l border-zinc-200 pl-2">
            <BookOpen className="h-3 w-3" />
            {duration}
          </span>
        </div>
        <h4 className="text-xl font-bold text-zinc-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">{title}</h4>
        <div className="mt-auto flex items-center gap-2 text-sm font-bold text-zinc-400 group-hover:text-blue-600 transition-all">
          Read Guide <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
