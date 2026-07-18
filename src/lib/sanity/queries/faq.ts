import { groq } from 'next-sanity';

// All published FAQs — for the /faq page (grouped by category)
export const ALL_FAQS_QUERY = groq`
  *[_type == "faq" && status == "published"] | order(category asc, order asc) {
    _id,
    question,
    answer,
    category
  }
`;

// Homepage subset — only FAQs flagged showOnHomepage
export const HOMEPAGE_FAQS_QUERY = groq`
  *[_type == "faq" && status == "published" && showOnHomepage == true] | order(order asc) {
    _id,
    question,
    answer,
    category
  }
`;

// Per-product-page subset — pass $slug as the relatedPage value
export const RELATED_FAQS_QUERY = groq`
  *[_type == "faq" && status == "published" && relatedPage == $slug] | order(order asc) {
    _id,
    question,
    answer
  }
`;
