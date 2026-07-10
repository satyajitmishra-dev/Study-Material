import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function RoadmapSlugRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/learn/${slug}`);
}
