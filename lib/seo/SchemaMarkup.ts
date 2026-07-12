export class SchemaMarkup {
  static organization() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'StudyMaterial',
      'url': 'https://studymaterial.utool.in',
      'logo': 'https://studymaterial.utool.in/logo.png',
      'sameAs': [
        'https://github.com/satyajitmishra-dev/Study-Material',
        'https://twitter.com/studymaterial',
        'https://linkedin.com/in/satyajitmishra'
      ]
    };
  }

  static website() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'StudyMaterial',
      'url': 'https://studymaterial.utool.in',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://studymaterial.utool.in/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    };
  }

  static article(data: {
    title: string;
    description: string;
    url: string;
    coverImage?: string;
    datePublished?: string;
    dateModified?: string;
    authorName: string;
    category?: string;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      'headline': data.title,
      'description': data.description,
      'image': data.coverImage || 'https://studymaterial.utool.in/og-default.png',
      'datePublished': data.datePublished || new Date().toISOString(),
      'dateModified': data.dateModified || new Date().toISOString(),
      'author': {
        '@type': 'Person',
        'name': data.authorName
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'StudyMaterial',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://studymaterial.utool.in/logo.png'
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': data.url
      },
      'articleSection': data.category || 'React'
    };
  }

  static course(data: {
    title: string;
    description: string;
    url: string;
    providerName: string;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      'name': data.title,
      'description': data.description,
      'provider': {
        '@type': 'Organization',
        'name': data.providerName,
        'sameAs': 'https://studymaterial.utool.in'
      }
    };
  }

  static person(data: {
    name: string;
    bio: string;
    url: string;
    image?: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': data.name,
      'description': data.bio,
      'image': data.image || undefined,
      'url': data.url,
      'sameAs': [
        data.github,
        data.twitter,
        data.linkedin
      ].filter(Boolean)
    };
  }

  static collection(data: {
    title: string;
    description: string;
    url: string;
    items: Array<{ name: string; url: string }>;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': data.title,
      'description': data.description,
      'url': data.url,
      'mainEntity': {
        '@type': 'ItemList',
        'numberOfItems': data.items.length,
        'itemListElement': data.items.map((item, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.name,
          'url': item.url
        }))
      }
    };
  }

  static faq(items: Array<{ question: string; answer: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': items.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      }))
    };
  }

  static breadcrumb(items: Array<{ name: string; url: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url
      }))
    };
  }

  static software(data: {
    name: string;
    description: string;
    url: string;
    logo?: string;
    authorName: string;
    downloadUrl?: string;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': data.name,
      'description': data.description,
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Web',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'author': {
        '@type': 'Person',
        'name': data.authorName
      },
      'downloadUrl': data.downloadUrl || undefined,
      'url': data.url,
      'image': data.logo || undefined
    };
  }

  static qa(data: {
    title: string;
    text: string;
    upvoteCount: number;
    answers: Array<{ text: string; upvoteCount: number; url: string }>;
    acceptedAnswerIndex?: number;
  }) {
    const mainEntity: any = {
      '@type': 'Question',
      'name': data.title,
      'text': data.text,
      'answerCount': data.answers.length,
      'upvoteCount': data.upvoteCount,
    };
    if (data.acceptedAnswerIndex !== undefined && data.answers[data.acceptedAnswerIndex]) {
      const accepted = data.answers[data.acceptedAnswerIndex];
      mainEntity.acceptedAnswer = {
        '@type': 'Answer',
        'text': accepted.text,
        'upvoteCount': accepted.upvoteCount,
        'url': accepted.url
      };
    }
    mainEntity.suggestedAnswer = data.answers
      .filter((_, idx) => idx !== data.acceptedAnswerIndex)
      .map(ans => ({
        '@type': 'Answer',
        'text': ans.text,
        'upvoteCount': ans.upvoteCount,
        'url': ans.url
      }));

    return {
      '@context': 'https://schema.org',
      '@type': 'QAPage',
      'mainEntity': mainEntity
    };
  }
}
