import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

export default function BlogHighlights() {
  const featuredPosts = [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  return (
    <section className="blog-highlights mt-4">
      <div className="blog-highlights-head">
        <div>
          <h4>Blog Mẹo Mua Sắm</h4>
          <p>Kinh nghiệm chọn thực phẩm và gợi ý hữu ích cho gia đình.</p>
        </div>
        <Link to="/blog" className="blog-highlights-more">
          Xem tất cả
        </Link>
      </div>

      <div className="blog-highlights-grid">
        {featuredPosts.map((post) => (
          <article key={post.id} className="blog-card">
            <Link to={`/blog/${post.slug}`} className="blog-card-image-wrap">
              <img src={post.coverImage} alt={post.title} className="blog-card-image" loading="lazy" />
            </Link>
            <div className="blog-card-content">
              <small>{formatDate(post.publishedAt)}</small>
              <Link to={`/blog/${post.slug}`} className="blog-card-title">
                {post.title}
              </Link>
              <p>{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
