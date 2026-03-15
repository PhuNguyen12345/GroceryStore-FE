const PromotionSelector = () => {

  return (

    <div className="mt-4">

      <label className="text-sm">
        Promotion
      </label>

      <select className="w-full border p-2">

        <option>No Promotion</option>
        <option>10% Discount</option>
        <option>Buy 2 Get 1</option>

      </select>

    </div>

  );
};

export default PromotionSelector;