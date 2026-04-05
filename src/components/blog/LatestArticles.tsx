import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SanityImage from "@/components/SanityImage";
import { getLatestPosts } from "@/lib/sanity.client";

interface LatestArticlesProps {
  currentSlug: string;
}

export default async function LatestArticles({ currentSlug }: LatestArticlesProps) {
  const latestPosts = await getLatestPosts(5, currentSlug);
  
  type LatestPost = {
    _id: string;
    slug: string;
    title: string;
    publishedAt?: string;
    mainImage?: any;
  };

  const posts = latestPosts as LatestPost[];

  if (posts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 mt-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-zinc-900 mb-4">Latest Articles</h2>
        <p className="text-zinc-600 max-w-2xl mx-auto">Discover more insights and tips from our blog</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.slice(0, 4).map((latest) => (
          <Link
            key={latest._id}
            href={`/blog/${latest.slug}`}
            className="group bg-white border border-zinc-200 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300"
          >
            <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
              <SanityImage
                image={latest.mainImage}
                alt={latest.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
              {latest.title}
            </h4>
            <span className="text-xs font-medium text-zinc-500">
              {latest.publishedAt ? new Date(latest.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
            </span>
          </Link>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          View All Articles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
