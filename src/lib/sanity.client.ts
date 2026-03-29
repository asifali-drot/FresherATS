import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'byw5korl',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-23',
  useCdn: process.env.NODE_ENV === 'production',
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

export async function getGuides() {
  return await client.fetch(`*[_type == "guide"]{
    _id,
    title,
    "slug": slug.current,
    description,
    mainImage,
    body
  }`);
}

// Added functions to fetch Blog Posts
export async function getPosts() {
  return await client.fetch(`*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    mainImage,
    publishedAt,
    author,
    "readingTime": select(defined(body) => round(length(pt::text(body)) / 5 / 200), 0)
  }`);
}

export async function getLatestPosts(limit: number = 5, excludeSlug?: string) {
  const query = excludeSlug 
    ? `*[_type == "post" && slug.current != $excludeSlug] | order(publishedAt desc)[0...$limit] {`
    : `*[_type == "post"] | order(publishedAt desc)[0...$limit] {`;
    
  return await client.fetch(`${query}
    _id,
    title,
    "slug": slug.current,
    mainImage,
    publishedAt,
    author,
    "readingTime": select(defined(body) => round(length(pt::text(body)) / 5 / 200), 0)
  }`, { limit, excludeSlug });
}

export async function getPost(slug: string) {
  return await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    metaTitle,
    metaDescription,
    keywords,
    mainImage,
    excerpt,
    body,
    publishedAt,
    author,
    faqs,
    "readingTime": select(defined(body) => round(length(pt::text(body)) / 5 / 200), 0)
  }`, { slug });
}

