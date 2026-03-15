import ProductItem from "./ProductItem";

const ProductGrid = ({ products, onAdd }) => {

  return (
    <div className="flex flex-col gap-3">

      {(products || []).map((p) => (
        <ProductItem
          key={p.id}
          product={p}
          onAdd={onAdd}
        />
      ))}

    </div>
  );
};

export default ProductGrid;