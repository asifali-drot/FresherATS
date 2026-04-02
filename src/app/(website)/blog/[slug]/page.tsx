import { getPost, getLatestPosts, urlFor } from "@/lib/sanity.client";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, User, ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import SanityImage from "@/components/SanityImage";
import FAQSection from "@/components/FAQSection";
import { generateFAQSchema } from "@/lib/seo";
import TableOfContents from "@/components/blog/TableOfContents";
import { createSlugger, extractToc } from "@/lib/blog/toc";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Post Not Found" };

  const ogImage = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : undefined;

  return {
    title: `${post.title} | ATS Analyzer Blog`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription || post.excerpt,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const latestPosts = await getLatestPosts(5, slug);
  const toc = extractToc(post.body);
  const sluggerForRender = createSlugger();
  type LatestPost = {
    _id: string;
    slug: string;
    title: string;
    publishedAt?: string;
    mainImage?: unknown;
  };

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Article Header */}
      <div className="pt-20 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <h1 className="text-[40px] md:text-[48px] font-extrabold tracking-tight text-zinc-900 mb-6 leading-tight max-w-4xl">
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
          {post.readingTime && post.readingTime > 0 && (
            <>
              <span className="text-zinc-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <BookOpen className="h-4 w-4 text-blue-500" />
                {post.readingTime} min read
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Image - Natural fit without distortion or cutting */}
      {post.mainImage && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
          <div className="rounded-3xl shadow-xl overflow-hidden bg-zinc-50 leading-0">
            <Image
              src={urlFor(post.mainImage).width(2000).quality(80).url()}
              alt={post.title}
              width={2000}
              height={1000}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      )}

      {/* Layout Grid: TOC (left), Content (center), Latest (right) */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Table of Contents */}
        <aside className="lg:col-span-3 lg:pr-2 lg:sticky lg:top-28 lg:h-fit lg:self-start z-20">
          <TableOfContents items={toc} />
        </aside>

        {/* Center: Article Content */}
        <div className="lg:col-span-6">
          <article className="prose-blog">
            {post.body ? (
              <PortableText
                value={post.body}
                components={{
                  block: {
                    h2: ({ children }) => {
                      const text = Array.isArray(children) ? children.join("") : String(children ?? "");
                      const id = sluggerForRender.slug(text);
                      return (
                        <h2 id={id} className="scroll-mt-28">
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children }) => {
                      const text = Array.isArray(children) ? children.join("") : String(children ?? "");
                      const id = sluggerForRender.slug(text);
                      return (
                        <h3 id={id} className="scroll-mt-28">
                          {children}
                        </h3>
                      );
                    },
                    h4: ({ children }) => {
                      const text = Array.isArray(children) ? children.join("") : String(children ?? "");
                      const id = sluggerForRender.slug(text);
                      return (
                        <h4 id={id} className="scroll-mt-28">
                          {children}
                        </h4>
                      );
                    },
                  },
                  types: {
                    image: ({ value }: any) => {
                      if (!value?.asset) return null;
                      return (
                        <div className="my-8">
                          <SanityImage
                            image={value}
                            alt={value.alt || post.title}
                            className="rounded-3xl"
                          />
                        </div>
                      );
                    },
                    code: ({ value }: any) => {
                      if (!value?.code) return null;
                      return (
                        <div className="my-8 overflow-x-auto rounded-3xl bg-slate-950 p-4 text-sm text-slate-100">
                          {value.filename ? (
                            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                              {value.filename}
                            </div>
                          ) : null}
                          <pre className="overflow-x-auto">
                            <code>{value.code}</code>
                          </pre>
                        </div>
                      );
                    },
                    htmlEmbed: ({ value }: any) => {
                      if (!value?.html) return null;
                      return <div dangerouslySetInnerHTML={{ __html: value.html }} />;
                    },
                  },
                }}
              />
            ) : (
              <p>No content available.</p>
            )}
          </article>
        </div>

        {/* Right: Latest Blogs */}
        <aside className="lg:col-span-3 border-l border-zinc-100 pl-0 lg:pl-10 lg:sticky lg:top-28 lg:h-fit lg:self-start z-10">
          <div>
            <h3 className="text-xl font-extrabold text-zinc-900 mb-8 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              Latest Articles
            </h3>

            <div className="space-y-8">
              {(latestPosts as LatestPost[]).map((latest) => (
                <Link
                  key={latest._id}
                  href={`/blog/${latest.slug}`}
                  className="group flex gap-4 items-start hover:bg-zinc-50 p-2 rounded-2xl transition-all"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <SanityImage
                      image={latest.mainImage}
                      alt={latest.title}
                      className="w-full h-full object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {latest.title}
                    </h4>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {latest.publishedAt ? new Date(latest.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/blog"
              className="mt-10 flex items-center justify-between p-4 rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm group hover:bg-blue-600 hover:text-white transition-all"
            >
              View All Articles
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </aside>
      </div>

      {/* FAQ Section */}
      {post.faqs && post.faqs.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <FAQSection 
            faqs={post.faqs} 
            title="Questions About This Topic"
          />
        </div>
      )}

      {/* FAQ Schema */}
      {post.faqs && post.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(post.faqs)) }}
        />
      )}
    </div>
  );
}
