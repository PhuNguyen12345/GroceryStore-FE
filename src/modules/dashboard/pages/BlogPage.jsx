import { Link } from "react-router-dom";
import Header from "../../../layouts/Header";
import Footer from "../../../layouts/Footer";
import { blogPosts } from "../data/blogPosts";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

export default function BlogPage() {
  const posts = [...blogPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <section className="blog-list-wrap">
            <div className="blog-list-head">
              <h2>Blog GroceryStore</h2>
              <p>Tổng hợp mẹo mua sắm, bảo quản và gợi ý thực đơn cho gia đình.</p>
            </div>

            <div className="blog-list-grid">
              {posts.map((post) => (
                <article key={post.id} className="blog-card">
                  <Link to={`/blog/${post.slug}`} className="blog-card-image-wrap">
                    <img src={post.coverImage} alt={post.title} className="blog-card-image" loading="lazy" />
                  </Link>
                  <div className="blog-card-content">
                    <small>{formatDate(post.publishedAt)}</small>
                    <Link to={`/blog/${post.slug}`} className="blog-card-title">{post.title}</Link>
                    <p>{post.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
