import { useEffect, useState } from "react";
import { customerService } from "@/core/api/customerService";

const CustomerPanel = ({ onSelect }) => {
  const [keyword, setKeyword] = useState("");
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    phone: "",
  });

  const useDebounce = (value, delay = 400) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
  };

  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    if (!debouncedKeyword) {
      setCustomers([]);
      return;
    }

    const fetch = async () => {
      try {
        const res = await customerService.searchCustomers({ keyword: debouncedKeyword });
        setCustomers(res?.content || []);
      } catch {
        setCustomers([]);
      }
    };

    fetch();
  }, [debouncedKeyword]);

  const handleCreate = async () => {
    const payload = {
      fullName: newCustomer.fullName?.trim(),
      phone: newCustomer.phone?.trim(),
    };

    if (!payload.phone) {
      alert("Vui lòng nhập số điện thoại khách hàng");
      return;
    }

    const created = await customerService.saveCustomer(payload);
    onSelect(created);
    setShowForm(false);
    setKeyword("");
    setCustomers([]);
    setNewCustomer({ fullName: "", phone: "" });
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Khách hàng</h3>

      <div className="flex gap-2 mb-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="SĐT hoặc tên..."
          className="border p-2 flex-1 rounded-lg"
        />
      </div>

      {customers.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelect(c)}
          className="p-2 border rounded mb-1 cursor-pointer hover:bg-gray-100"
        >
          {c.fullName} - {c.phone}
        </div>
      ))}

      <button
        onClick={() => setShowForm(!showForm)}
        className="text-sm text-blue-600 mt-2"
      >
        + Thêm khách mới
      </button>

      {showForm && (
        <div className="mt-2 space-y-2">
          <input
            placeholder="Tên"
            className="border p-2 w-full rounded"
            value={newCustomer.fullName}
            onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
          />

          <input
            placeholder="SĐT"
            className="border p-2 w-full rounded"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          />

          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-3 py-1 rounded w-full"
          >
            Lưu khách
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerPanel;
