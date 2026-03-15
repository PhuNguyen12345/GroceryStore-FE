import { productService } from "@/core/api/productService";
import { useState } from "react";

const ProductSearch = ({ onSelect }) => {

  const [keyword,setKeyword] = useState("");

  const handleSearch = async (page = 0) => {

    const res = await productService.searchProducts(keyword);

    onSelect(res.content);

  };

  return (
    <div className="flex gap-2 mb-3">

      <input
        className="
    border
    border-gray-200
    rounded-lg
    px-4
    py-2
    flex-1
    focus:outline-none
    focus:ring-2
    focus:ring-[#2c9a67]
    "
        placeholder="Scan barcode or search..."
        value={keyword}
        onChange={(e)=>setKeyword(e.target.value)}
        onKeyDown={(e)=>{

          if(e.key==="Enter"){
            handleSearch();
          }

        }}
      />

      <button
        className="
  bg-[#1a7a4d]
  hover:bg-[#145a3a]
  text-white
  px-5
  rounded-lg
  font-medium
  transition
  "
        onClick={handleSearch}
      >
        Search
      </button>

    </div>
  );
};

export default ProductSearch;