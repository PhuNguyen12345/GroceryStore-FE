import ProductItem from "./ProductItem";

const ProductGrid = ({ products, onAdd, page, totalPages, onPageChange }) => {
  return (
    <div className="flex flex-col gap-3">
      {products.map((p) => (
        <ProductItem key={p.id} product={p} onAdd={onAdd} />
      ))}

      <div className="flex justify-center mt-4 gap-2">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-3 py-1 border rounded ${
              page === i ? "bg-green-600 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductGrid;
