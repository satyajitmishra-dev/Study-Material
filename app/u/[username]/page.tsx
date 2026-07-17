import { notFound, permanentRedirect } from 'next/navigation';
import { publicDb } from '@/lib/database/publicDb';
import DeveloperProfileClient from '@/components/public/DeveloperProfileClient';
import { Metadata } from 'next';
import { auth } from '@/auth';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profileData = await publicDb.getDeveloperProfile(username);
  
  if (!profileData) {
    return {
      title: 'Profile Not Found | StudyMaterial',
      description: 'The requested developer profile does not exist.'
    };
  }

  const name = profileData.user.name || username;
  const bio = profileData.user.authorProfile?.bio || `Check out ${name}'s developer profile on StudyMaterial.`;
  const avatar = profileData.user.avatar || profileData.user.image || '';
  const coverImage = profileData.user.authorProfile?.coverImage || '';

  return {
    title: `${name} (@${username}) — Developer Portfolio`,
    description: bio,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/u/${username}`
    },
    openGraph: {
      title: `${name} (@${username}) | Developer Showcase`,
      description: bio,
      images: coverImage ? [{ url: coverImage }] : avatar ? [{ url: avatar }] : [],
      type: 'profile',
      username: username
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} (@${username}) — Developer Portfolio`,
      description: bio,
      images: coverImage ? [coverImage] : avatar ? [avatar] : []
    }
  };
}

export const dynamic = 'force-dynamic';

export default async function DeveloperProfilePage({ params }: PageProps) {
  const { username } = await params;
  const session = await auth();
  const profileData = await publicDb.getDeveloperProfile(username, session?.user?.id);

  if (!profileData) {
    const redir = await publicDb.getCmsRedirect(`/u/${username}`);
    if (redir) {
      permanentRedirect(redir.targetPath);
    }

    const history = await publicDb.getUsernameHistory(username);
    if (history) {
      const targetUser = history.user || await publicDb.getUserById(history.userId);
      if (targetUser?.username) {
        permanentRedirect(`/u/${targetUser.username}`);
      }
    }

    notFound();
  }

  // Structured Data JSON-LD
  const name = profileData.user.name || username;
  const bio = profileData.user.authorProfile?.bio || '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': name,
    'alternateName': username,
    'description': bio,
    'image': profileData.user.avatar || profileData.user.image,
    'jobTitle': profileData.user.authorProfile?.headline,
    'homeLocation': {
      '@type': 'Place',
      'name': profileData.user.authorProfile?.location || 'Remote'
    },
    'url': `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/u/${username}`,
    'sameAs': [
      profileData.user.authorProfile?.github,
      profileData.user.authorProfile?.linkedin,
      profileData.user.authorProfile?.twitter
    ].filter(Boolean)
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <DeveloperProfileClient 
        username={username}
        initialUser={profileData.user}
        initialProjects={profileData.projects}
        initialPosts={profileData.posts}
        initialFollowers={profileData.followers}
        initialFollowing={profileData.following}
        initialBookmarks={profileData.bookmarks || []}
        sessionUser={session?.user || null}
      />
    </>
  );
}
