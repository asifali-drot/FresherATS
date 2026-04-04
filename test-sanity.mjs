
import { getPosts, getPost } from './src/lib/sanity.client';

async function test() {
  console.log('Testing Sanity queries...');
  try {
    const posts = await getPosts();
    console.log(`Found ${posts.length} posts.`);
    if (posts.length > 0) {
      const firstSlug = posts[0].slug;
      console.log(`Testing getPost with slug: "${firstSlug}"`);
      const post = await getPost(firstSlug);
      if (post) {
        console.log('Successfully fetched post:', post.title);
      } else {
        console.log('Failed to fetch post. getPost returned null.');
      }
    } else {
      console.log('No posts found to test.');
    }
  } catch (err) {
    console.error('Error during test:', err);
  }
}

test();
