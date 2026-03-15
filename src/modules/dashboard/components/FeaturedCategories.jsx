import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { categoryService } from "../../../core/api/categoryService";
import { Apple, Beef, CookingPot, House, Sparkles, Tag } from "lucide-react";

const iconList = [Apple, Beef, CookingPot, House, Sparkles, Tag];

function flattenCategoryTree(tree = []) {
  return tree.reduce((acc, node) => {
    if (node?.id) {
      acc.push({ id: node.id, name: node.name });
    }
    return acc;
  }, []);
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const tree = await categoryService.getCategoryTreeActive();
        const normalized = Array.isArray(tree) ? flattenCategoryTree(tree) : [];
        setCategories(normalized.slice(0, 6));
      } catch {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const items = useMemo(() => categories.slice(0, 6), [categories]);

  if (!items.length) return null;

  return (
    <section className="featured-categories mt-4">
      <div className="featured-categories-head">
        <h4>Danh mục nổi bật</h4>
        <p>Chọn nhanh nhóm hàng đang được quan tâm nhiều tại cửa hàng.</p>
      </div>

      <div className="featured-categories-grid">
        {items.map((item, index) => {
          const Icon = iconList[index % iconList.length];
          return (
            <Link
              key={item.id}
              to={`/products?categoryId=${item.id}&categoryName=${encodeURIComponent(item.name || "")}`}
              className="featured-category-link"
            >
              <article className="featured-category-card">
                <div className="featured-category-icon">
                  <Icon size={16} />
                </div>
                <h6>{item.name}</h6>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
