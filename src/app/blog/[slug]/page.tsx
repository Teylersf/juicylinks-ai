import { BlogPost } from '@/components/blog-post'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/lib/blog-data'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = blogPosts.find((post) => post.slug === slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | Juicy Links Blog',
    }
  }

  return {
    title: `${post.title} | Juicy Links Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = blogPosts.find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  return <BlogPost post={post} />
}
