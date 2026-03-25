import { useEffect, useState } from "react";
import { productService } from "@/core/api/productService";
import { productUnitService } from "@/core/api/productUnitService";
import { inventoryService } from "@/core/api/inventoryService";

let cachedWarehouseIds = null;
let cachedWarehousePromise = null;
let stockLookupForbidden = false;

async function getWarehouseIds() {
  if (stockLookupForbidden) return null;
  if (cachedWarehouseIds) return cachedWarehouseIds;
  if (cachedWarehousePromise) return cachedWarehousePromise;

  cachedWarehousePromise = inventoryService
    .getWarehouses({ page: 0, size: 200 })
    .then((result) => {
      const ids = (result?.content || [])
        .map((w) => Number(w?.id))
        .filter((id) => Number.isFinite(id) && id > 0);
      cachedWarehouseIds = ids;
      return ids;
    })
    .catch((error) => {
      if (error?.response?.status === 403) {
        stockLookupForbidden = true;
      }
      return null;
    })
    .finally(() => {
      cachedWarehousePromise = null;
    });

  return cachedWarehousePromise;
}

async function getUnitStockAcrossWarehouses(productUnitId) {
  const warehouseIds = await getWarehouseIds();
  if (!warehouseIds?.length) return null;

  const stockByWarehouse = await Promise.all(
    warehouseIds.map((warehouseId) =>
      inventoryService.getAvailableStock(productUnitId, warehouseId),
    ),
  );

  return stockByWarehouse.reduce((sum, qty) => sum + Number(qty || 0), 0);
}

const ProductItem = ({ product, onAdd, refreshKey }) => {
  const [qty, setQty] = useState(1);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [availableStock, setAvailableStock] = useState(null);
  const [stockError, setStockError] = useState(false);

  const loadUnits = async () => {
    try {
      const data = await productUnitService.getUnitsByProduct(product.id);
      const normalized = Array.isArray(data) ? data : [];
      setUnits(normalized);

      if (normalized.length > 0) {
        setSelectedUnit(normalized[0]);
      }
    } catch (err) {
      console.error(err);
      setUnits([]);
      setSelectedUnit(null);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadStock = async () => {
      if (!selectedUnit?.id) {
        if (mounted) {
          setAvailableStock(null);
          setStockError(false);
        }
        return;
      }

      try {
        setStockError(false);
        const selectedStock = await getUnitStockAcrossWarehouses(selectedUnit.id);
        if (mounted) {
          setAvailableStock(Number(selectedStock ?? 0));
        }
      } catch {
        if (mounted) {
          setAvailableStock(null);
          setStockError(true);
        }
      }
    };

    loadStock();

    return () => {
      mounted = false;
    };
  }, [selectedUnit?.id, refreshKey]);

  const increase = () => setQty((prev) => prev + 1);

  const decrease = () => {
    setQty((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleUnitChange = (e) => {
    const unitId = Number(e.target.value);
    const unit = units.find((u) => u.id === unitId);
    setSelectedUnit(unit || null);
  };

  const handleAdd = () => {
    if (!selectedUnit) return;

    onAdd({
      productUnitId: selectedUnit.id,
      quantity: qty,
    });

    setQty(1);
  };

  const stockText = stockError ? "N/A" : Number(availableStock ?? 0);

  return (
    <div className="flex items-center border p-3 rounded gap-4">
      <img
        src={productService.toAbsoluteMediaUrl(product.imageUrl)}
        alt={product.name}
        className="w-20 h-20 object-cover"
      />

      <div className="flex-1">
        <div className="font-medium">{product.name}</div>

        <div className="mt-2 flex gap-2 items-center">
          <select
            value={selectedUnit?.id || ""}
            onChange={handleUnitChange}
            className="border px-2 py-1"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.unitName} - {u.sellingPrice}đ
              </option>
            ))}
          </select>

          {selectedUnit && (
            <div className="text-green-600 font-medium">
              {selectedUnit.sellingPrice ?? selectedUnit.price}đ
            </div>
          )}
        </div>

        {selectedUnit && (
          <div className="text-sm mt-1 text-gray-600">
            Tồn kho (tất cả kho): <span className="font-semibold">{stockText}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <button className="px-2 border" onClick={decrease}>
            -
          </button>

          <div className="px-3">{qty}</div>

          <button className="px-2 border" onClick={increase}>
            +
          </button>

          <button
            className="ml-4 bg-green-500 text-white px-4 py-1 rounded"
            onClick={handleAdd}
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
