import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicStory } from "@/features/stories/service";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params,
    story = publicStory(slug);
  if (!story) return {};
  return {
    title: story.title,
    description: story.seo_description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${process.env.APP_ORIGIN ?? "http://localhost:3000"}/noticias/${slug}`,
    },
    openGraph: {
      title: story.title,
      description: story.seo_description,
      type: "article",
      publishedTime: story.published_at ?? undefined,
    },
    twitter: { card: "summary", title: story.title, description: story.seo_description },
  };
}
export default async function PublicStory({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params,
    story = publicStory(slug);
  if (!story) notFound();
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.title,
    description: story.seo_description,
    datePublished: story.published_at,
    dateModified: story.updated_at,
    author: { "@type": "Person", name: story.author_name },
  };
  return (
    <div className="public-page">
      <header>
        <Link href="/" className="public-brand">
          newsroom<span>360</span>
        </Link>
        <span>JORNALISMO COM CONTEXTO</span>
      </header>
      <article className="story-preview">
        <div className="eyebrow">{story.desk}</div>
        <h1>{story.title}</h1>
        <p className="story-subtitle">{story.subtitle}</p>
        <small>
          Por {story.author_name} ·{" "}
          {new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo",
            dateStyle: "long",
            timeStyle: "short",
          }).format(new Date(story.published_at ?? story.updated_at))}
        </small>
        <div className="article-body preserve-lines">{story.body}</div>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
