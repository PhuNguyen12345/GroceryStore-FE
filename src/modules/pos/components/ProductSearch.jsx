import { productService } from "@/core/api/productService";
import { useEffect, useState } from "react";

const ProductSearch = ({ onSelect }) => {
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await productService.searchProducts(keyword, 0, 6);
        onSelect(res.content);
      } catch (err) {
        console.error(err);
      }
    }, 400); // delay 400ms

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  return (
    <div className="flex gap-2 mb-3">
      <input
        className="border border-gray-200 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#2c9a67]"
        placeholder="Tìm kiếm sản phẩm..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
    </div>
  );
};

export default ProductSearch;
