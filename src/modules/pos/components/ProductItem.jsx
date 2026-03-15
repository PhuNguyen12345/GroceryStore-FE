import { useEffect, useState } from "react";
import { productService } from "@/core/api/productService";
import { productUnitService } from "@/core/api/productUnitService";

const ProductItem = ({ product, onAdd }) => {

  const [qty, setQty] = useState(1);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const data = await productUnitService.getUnitsByProduct(product.id);
      setUnits(data);

      if (data.length > 0) {
        setSelectedUnit(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const increase = () => setQty(qty + 1);

  const decrease = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleUnitChange = (e) => {
    const unitId = Number(e.target.value);
    const unit = units.find(u => u.id === unitId);
    setSelectedUnit(unit);
  };

  const handleAdd = () => {

    if (!selectedUnit) return;

    onAdd({
      productUnitId: selectedUnit.id,
      quantity: qty
    });

    setQty(1);
  };

  return (
    <div className="flex items-center border p-3 rounded gap-4">

      {/* IMAGE */}
      <img
        src={productService.toAbsoluteMediaUrl(product.imageUrl)}
        alt={product.name}
        className="w-20 h-20 object-cover"
      />

      {/* INFO */}
      <div className="flex-1">

        <div className="font-medium">
          {product.name}
        </div>

        {/* UNIT SELECT */}
        <div className="mt-2 flex gap-2 items-center">

          <select
            value={selectedUnit?.id || ""}
            onChange={handleUnitChange}
            className="border px-2 py-1"
          >
            {units.map(u => (
              <option key={u.id} value={u.id}>
                {u.unitName} - {u.price}₫
              </option>
            ))}
          </select>

          {/* PRICE */}
          {selectedUnit && (
            <div className="text-green-600 font-medium">
              {selectedUnit.price}₫
            </div>
          )}

        </div>

        {/* QUANTITY */}
        <div className="flex items-center gap-2 mt-2">

          <button
            className="px-2 border"
            onClick={decrease}
          >
            -
          </button>

          <div className="px-3">
            {qty}
          </div>

          <button
            className="px-2 border"
            onClick={increase}
          >
            +
          </button>

          <button
            className="ml-4 bg-green-500 text-white px-4 py-1 rounded"
            onClick={handleAdd}
          >
            Add
          </button>

        </div>

      </div>

    </div>
  );
};

export default ProductItem;