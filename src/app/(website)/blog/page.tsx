"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPosts, urlFor } from "@/lib/sanity.client";
import { 
  FileText, 
  ArrowRight, 
  Search,
  BookOpen,
  Sparkles,
  CalendarDays,
  User
} from "lucide-react";
import SanityImage from "@/components/SanityImage";

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  mainImage?: any;
  publishedAt?: string;
  author?: string;
  readingTime?: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Simple Hero Section */}
      <section className="py-20 bg-zinc-50 border-b border-zinc-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Insights & Updates
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl mb-6">
            Our Blog
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The latest news, tips, and strategies for accelerating your career and getting the most out of your resume.
          </p>
          
          {/* Static Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              className="block w-full pl-11 pr-4 py-4 border border-zinc-200 rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Latest Articles</h2>
              <p className="text-zinc-600">Explore our most recent insights and tips.</p>
            </div>
          </div>

          {isLoading ? (
             <div className="min-h-[400px] flex items-center justify-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
             </div>
          ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {posts.length > 0 ? (
                 posts.map((post) => (
                   <BlogCard 
                     key={post._id}
                     image={post.mainImage ? urlFor(post.mainImage).url() : "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800"}
                     title={post.title}
                     excerpt={post.excerpt}
                     slug={post.slug}
                     publishedAt={post.publishedAt}
                     author={post.author}
                     readingTime={post.readingTime}
                   />
                 ))
               ) : (
                 <div className="col-span-full text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                   <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                   <h3 className="text-xl font-bold text-zinc-900 mb-2">No Posts Found</h3>
                   <p className="text-zinc-500">Check back later for new articles.</p>
                 </div>
               )}
             </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BlogCard({ image, title, excerpt, slug, publishedAt, author, readingTime }: { image: string, title: string, excerpt: string, slug?: string, publishedAt?: string, author?: string, readingTime?: number }) {
  const formattedDate = publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  
  return (
    <Link href={slug ? `/blog/${slug}` : "#"} className="group flex flex-col md:flex-row gap-6 p-4 rounded-3xl border border-zinc-100 bg-white hover:border-blue-100 hover:shadow-lg transition-all">
      <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shrink-0">
        <SanityImage 
          image={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
      </div>
      <div className="flex flex-col justify-center py-4">
        <div className="flex items-center gap-3 mb-3 text-xs text-zinc-500 font-medium whitespace-nowrap overflow-hidden">
          {author && (
            <span className="flex items-center gap-1.5 shrink-0">
              <User className="h-3.5 w-3.5" />
              {author}
            </span>
          )}
          {author && formattedDate && <span className="text-zinc-300">•</span>}
          {formattedDate && (
             <span className="flex items-center gap-1.5 shrink-0">
              <CalendarDays className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          )}
          {(formattedDate || author) && readingTime && readingTime > 0 && <span className="text-zinc-300">•</span>}
          {readingTime && readingTime > 0 && (
             <span className="flex items-center gap-1.5 shrink-0">
              <BookOpen className="h-3.5 w-3.5" />
              {readingTime} min read
            </span>
          )}
        </div>
        <h4 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{title}</h4>
        {excerpt && <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{excerpt}</p>}
        <div className="mt-auto flex items-center gap-2 text-sm font-bold text-zinc-400 group-hover:text-blue-600 transition-all">
          Read Article <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
