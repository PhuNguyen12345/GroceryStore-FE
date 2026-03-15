import { useEffect, useMemo, useState } from "react";
import { brandService } from "../../../core/api/brandService";

function getLogoUrl(item) {
  return brandService.toAbsoluteMediaUrl(item.logoUrl || item.imageUrl || "");
}

export default function BrandLogoStrip() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const result = await brandService.getAllBrands(0, 50);
        const rows = Array.isArray(result?.content) ? result.content.filter((item) => item?.isActive !== false) : [];
        setBrands(rows);
      } catch {
        setBrands([]);
      }
    };

    loadBrands();
  }, []);

  const trackItems = useMemo(() => {
    const valid = brands.filter((item) => getLogoUrl(item));
    return [...valid, ...valid];
  }, [brands]);

  if (!trackItems.length) return null;

  return (
    <section className="mt-3">
      <div className="brand-marquee-mask">
        <div className="brand-marquee-track">
          {trackItems.map((item, index) => (
            <div className="brand-marquee-item" key={`${item.id}-${index}`}>
              <img src={getLogoUrl(item)} alt={item.name || "Brand"} className="brand-marquee-image" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
