import { getPosts } from "@/lib/sanity.client";
import BlogContent from "./BlogContent";

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  mainImage?: unknown;
  publishedAt?: string;
  author?: string;
  readingTime?: number;
}

export default async function BlogPage() {
  let posts: Post[] = [];
  try {
    posts = await getPosts();
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }

  return <BlogContent initialPosts={posts} />;
}
