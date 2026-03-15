import { Link, useParams } from "react-router-dom";
import Header from "../../../layouts/Header";
import Footer from "../../../layouts/Footer";
import { getBlogPostBySlug } from "../data/blogPosts";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1 py-4">
          <div className="container">
            <div className="blog-detail-wrap text-center">
              <h2 className="mb-2">Không tìm thấy bài viết</h2>
              <p className="text-muted mb-3">Bài viết bạn chọn không còn tồn tại hoặc đã được cập nhật.</p>
              <Link to="/blog" className="btn btn-success">Quay lại Blog</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <article className="blog-detail-wrap">
            <img src={post.coverImage} alt={post.title} className="blog-detail-cover" />
            <div className="blog-detail-head">
              <small>{formatDate(post.publishedAt)}</small>
              <h1>{post.title}</h1>
              <p>{post.excerpt}</p>
            </div>

            <div className="blog-detail-tags">
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="blog-detail-content">
              {post.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-4">
              <Link to="/blog" className="blog-highlights-more">← Quay lại danh sách Blog</Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
