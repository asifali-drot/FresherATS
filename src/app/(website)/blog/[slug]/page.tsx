import { getPost, urlFor } from "@/lib/sanity.client";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { notFound } from "next/navigation";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : '';

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Article Header */}
      <div className="pt-20 pb-12 px-6 lg:px-8 max-w-4xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 mb-6 leading-tight">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 font-medium">
          {post.author && (
            <span className="flex items-center gap-1.5 shrink-0">
              <User className="h-4 w-4" />
              {post.author}
            </span>
          )}
          {post.author && formattedDate && <span className="text-zinc-300 hidden sm:inline">•</span>}
          {formattedDate && (
             <span className="flex items-center gap-1.5 shrink-0">
              <CalendarDays className="h-4 w-4" />
              {formattedDate}
            </span>
          )}
        </div>
      </div>

      {post.mainImage && (
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="aspect-[21/9] w-full bg-zinc-100 rounded-3xl overflow-hidden relative">
            <img 
              src={urlFor(post.mainImage).url()} 
              alt={post.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-6">
        <article className="prose prose-zinc prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-2xl max-w-none">
          {post.body ? (
            <PortableText value={post.body} />
          ) : (
            <p>No content available.</p>
          )}
        </article>
      </div>
    </div>
  );
}
