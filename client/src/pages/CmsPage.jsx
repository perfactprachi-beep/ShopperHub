import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function ChevronRight() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded ${className}`} />;
}

export default function CmsPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setPage(null);

    fetch(`/api/pages/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(json => {
        if (json?.success) setPage(json.data);
        else if (json) setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Skeleton className="h-4 w-48 mb-10" />
        <Skeleton className="h-9 w-2/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-10" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mb-6">
            <Skeleton className="h-6 w-1/3 mb-3" />
            <Skeleton className="h-4 w-full mb-1.5" />
            <Skeleton className="h-4 w-full mb-1.5" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h1>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-[#8B1A2F] text-white text-sm font-semibold rounded-lg hover:bg-[#6d1424] transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.meta_title || `${page.title} | ShoppersHub`}</title>
        {page.meta_description && (
          <meta name="description" content={page.meta_description} />
        )}
      </Helmet>

      {/* Hero strip */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link to="/" className="hover:text-[#8B1A2F] transition-colors">Home</Link>
            <ChevronRight />
            <span className="text-gray-600 font-medium">{page.title}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {page.title}
          </h1>
          {page.excerpt && (
            <p className="mt-3 text-gray-500 text-base max-w-2xl">{page.excerpt}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-14">
        <div
          className="cms-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Last updated */}
        <p className="mt-14 pt-6 border-t border-gray-100 text-xs text-gray-400">
          Last updated:{' '}
          {new Date(page.updated_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
      </div>

      {/* CMS content styles — scoped via class */}
      <style>{`
        .cms-content h1,
        .cms-content h2,
        .cms-content h3 {
          font-weight: 700;
          color: #111827;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .cms-content h1 { font-size: 1.875rem; }
        .cms-content h2 { font-size: 1.375rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.5rem; }
        .cms-content h3 { font-size: 1.125rem; }
        .cms-content p  { color: #374151; line-height: 1.75; margin-bottom: 1rem; }
        .cms-content ul,
        .cms-content ol { padding-left: 1.5rem; margin-bottom: 1rem; color: #374151; line-height: 1.75; }
        .cms-content li { margin-bottom: 0.35rem; }
        .cms-content ul li { list-style-type: disc; }
        .cms-content ol li { list-style-type: decimal; }
        .cms-content strong { font-weight: 600; color: #111827; }
        .cms-content em    { font-style: italic; }
        .cms-content a     { color: #8B1A2F; text-decoration: underline; }
        .cms-content a:hover { color: #6d1424; }
        .cms-content code  { background: #f3f4f6; padding: 0.1em 0.35em; border-radius: 0.25rem; font-size: 0.875em; }
        .cms-content blockquote {
          border-left: 3px solid #8B1A2F;
          padding-left: 1rem;
          color: #6b7280;
          font-style: italic;
          margin: 1.5rem 0;
        }
      `}</style>
    </>
  );
}
