export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };
}

export interface ArticleSchemaProps {
  title: string;
  description?: string;
  image?: string;
  publishedAt?: string;
  modifiedAt?: string;
  authorName?: string;
  url: string;
}

export function generateArticleSchema(props: ArticleSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": props.title,
    "description": props.description,
    "image": props.image ? [props.image] : [],
    "datePublished": props.publishedAt,
    "dateModified": props.modifiedAt || props.publishedAt,
    "author": [{
      "@type": "Person",
      "name": props.authorName || "ATS Analyzer Team"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Fresher ATS",
      "logo": {
        "@type": "ImageObject",
        "url": "https://fresherats.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": props.url
    }
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FresherATS",
    "url": "https://fresherats.com",
    "logo": "https://fresherats.com/logo.png",
    "description": "Advanced ATS resume analyzer for fresh graduates.",
  };
}

export function generateSoftwareApplicationSchema(props: { name: string; url: string; description: string; applicationCategory: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": props.name,
    "url": props.url,
    "description": props.description,
    "applicationCategory": props.applicationCategory,
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
}

export function generateItemListSchema(items: { name: string; url: string; description: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.name,
        "url": item.url,
        "description": item.description
      }
    }))
  };
}

export function generateReviewAggregateSchema(props: { 
  name: string; 
  ratingValue: number; 
  ratingCount: number; 
  reviews: { authorName: string; rating: number; reviewBody: string; datePublished: string }[] 
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": props.name,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": props.ratingValue,
      "reviewCount": props.ratingCount,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": props.reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.authorName
      },
      "datePublished": review.datePublished,
      "reviewBody": review.reviewBody,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      }
    }))
  };
}
