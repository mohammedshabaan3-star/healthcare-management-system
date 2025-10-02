import React, { useState, useEffect } from "react";
import axios from "../../utils/api";

const MedicalProtocolsManagement = ({ user }) => {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProtocol, setNewProtocol] = useState({
    name: "",
    code: "",
    description: ""
  });

  // جلب البروتوكولات
  const fetchProtocols = async () => {
    try {
      const res = await axios.get("/protocols", { withCredentials: true });
      setProtocols(res.data);
    } catch (err) {
      console.error("فشل في جلب البروتوكولات:", err);
      setError("فشل في جلب البروتوكولات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtocols();
  }, []);

  // إضافة بروتوكول جديد
  const addProtocol = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/protocols", newProtocol, { withCredentials: true });
      setNewProtocol({ name: "", code: "", description: "" });
      fetchProtocols();
    } catch (err) {
      console.error("فشل في إضافة البروتوكول:", err);
      alert(err.response?.data?.error || "حدث خطأ أثناء الإضافة");
    }
  };

  // تحديث بروتوكول (بما في ذلك تعديل الاسم أو الوصف أو الكود)
  const updateProtocol = async (id, updatedData) => {
    try {
      await axios.put(`/protocols/${id}`, updatedData, { withCredentials: true });
      fetchProtocols();
    } catch (err) {
      console.error("فشل في تحديث البروتوكول:", err);
      alert(err.response?.data?.error || "خطأ في التحديث");
    }
  };

  // حذف بروتوكول
  const deleteProtocol = async (id) => {
    if (!window.confirm("هل تريد حذف هذا البروتوكول؟")) return;
    try {
      await axios.delete(`/protocols/${id}`, { withCredentials: true });
      fetchProtocols();
    } catch (err) {
      console.error("فشل في حذف البروتوكول:", err);
      alert(err.response?.data?.error || "خطأ في الحذف");
    }
  };

  // تغيير حالة بروتوكول
  const toggleStatus = async (id) => {
    try {
      await axios.patch(`/protocols/${id}/toggle-status`, {}, { withCredentials: true });
      fetchProtocols();
    } catch (err) {
      console.error("فشل في تغيير حالة البروتوكول:", err);
      alert(err.response?.data?.error || "خطأ في تغيير الحالة");
    }
  };

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px", direction: "rtl" }}>
      <h2 style={{ textAlign: "center", color: "#007bff", marginBottom: "30px" }}>إدارة البروتوكولات</h2>

      {/* ✅ نموذج إضافة بروتوكول */}
      {user?.roles.includes("admin") && (
        <form onSubmit={addProtocol} style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="اسم البروتوكول"
            value={newProtocol.name}
            onChange={(e) => setNewProtocol({ ...newProtocol, name: e.target.value })}
            required
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <input
            type="text"
            placeholder="الكود"
            value={newProtocol.code}
            onChange={(e) => setNewProtocol({ ...newProtocol, code: e.target.value })}
            required
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <input
            type="text"
            placeholder="الوصف"
            value={newProtocol.description}
            onChange={(e) => setNewProtocol({ ...newProtocol, description: e.target.value })}
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <button
            type="submit"
            style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px" }}
          >
            ➕ إضافة
          </button>
        </form>
      )}

      {/* ✅ جدول البروتوكولات */}
      <table border="1" cellPadding="5" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f8f9fa" }}>
          <tr>
            <th>الاسم</th>
            <th>الكود</th>
            <th>الوصف</th>
            <th>الحالة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {protocols.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.code}</td>
              <td>{p.description}</td>
              <td>{p.isActive ? "✅ مفعل" : "❌ معطل"}</td>
              <td style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                <button onClick={() => toggleStatus(p.id)} style={{ padding: "3px 8px" }}>
                  {p.isActive ? "تعطيل" : "تفعيل"}
                </button>
                <button onClick={() => deleteProtocol(p.id)} style={{ padding: "3px 8px", backgroundColor: "#dc3545", color: "#fff" }}>
                  🗑️ حذف
                </button>
                <button
                  onClick={() =>
                    updateProtocol(p.id, {
                      ...p,
                      description: prompt("تعديل الوصف:", p.description) || p.description
                    })
                  }
                  style={{ padding: "3px 8px", backgroundColor: "#ffc107" }}
                >
                  ✏️ تعديل الوصف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedicalProtocolsManagement;
