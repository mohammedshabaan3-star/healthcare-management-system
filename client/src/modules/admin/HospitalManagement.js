import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const HospitalManagement = () => {
  const [allHospitals, setAllHospitals] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingHospital, setEditingHospital] = useState(null);
  const currentRole = JSON.parse(localStorage.getItem('user') || 'null')?.activeRole;

  const [filters, setFilters] = useState({
    governorate: "",
    searchTerm: "",
    minIcuBeds: "",
    hasPediatricBeds: "",
  });

  const [governorates, setGovernorates] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 100;

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await api.get("/hospitals", {
        params: { page: 1, limit: 10000 },
      });
      const all = response.data.data;
      setAllHospitals(all);
      setHospitals(all.slice(0, limit));
      setPage(1);

      const uniqueGovernorates = [
        ...new Set(all.map((h) => h.governorate).filter(Boolean)),
      ];
      setGovernorates(uniqueGovernorates);

      setLoading(false);
    } catch (error) {
      console.error("فشل في جلب المستشفيات:", error);
      setMessage("❌ فشل في تحميل المستشفيات");
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...allHospitals];

    if (filters.searchTerm.trim()) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.code.toLowerCase().includes(term) ||
          h.name.toLowerCase().includes(term) ||
          h.governorate.toLowerCase().includes(term)
      );
    }

    if (filters.governorate) {
      filtered = filtered.filter((h) => h.governorate === filters.governorate);
    }

    if (filters.minIcuBeds) {
      filtered = filtered.filter(
        (h) => h.icuBeds >= parseInt(filters.minIcuBeds)
      );
    }

    if (filters.hasPediatricBeds === "yes") {
      filtered = filtered.filter((h) => h.pediatricBeds > 0);
    } else if (filters.hasPediatricBeds === "no") {
      filtered = filtered.filter((h) => h.pediatricBeds === 0);
    }

    setPage(1);
    setHospitals(filtered.slice(0, limit));
  }, [filters, allHospitals]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      governorate: "",
      searchTerm: "",
      minIcuBeds: "",
      hasPediatricBeds: "",
    });
  };

  const handlePageChange = (newPage) => {
    const start = (newPage - 1) * limit;
    const end = start + limit;
    setHospitals(allHospitals.slice(start, end));
    setPage(newPage);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذا المستشفى؟")) return;
    try {
      await api.delete(`/hospitals/${id}`);
      setMessage("✅ تم حذف المستشفى بنجاح");
      fetchHospitals();
    } catch (error) {
      console.error("فشل في حذف المستشفى:", error);
      setMessage("❌ فشل في حذف المستشفى");
    }
  };

  const startEdit = (hospital) => {
    setEditingHospital({ ...hospital });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/hospitals/${editingHospital.id}`, editingHospital);
      setMessage("✅ تم تحديث بيانات المستشفى بنجاح");
      setEditingHospital(null);
      fetchHospitals();
    } catch (error) {
      console.error("فشل في تعديل المستشفى:", error);
      setMessage("❌ فشل في تعديل بيانات المستشفى");
    }
  };

  if (loading)
    return <div style={{ padding: 20, textAlign: "center" }}>⏳ جارٍ التحميل...</div>;

  return (
    <div style={{ padding: 20, direction: "rtl" }}>
      <h2 style={{ textAlign: "center", color: "#007bff" }}>🏥 إدارة المستشفيات</h2>
      {message && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: 10,
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          {message}
        </div>
      )}

      {/* 🔎 البحث والفلاتر */}
      <div style={{ backgroundColor: "white", padding: 20, borderRadius: 8, margin: "20px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h4>🔎 البحث والتصفية</h4>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <input
            type="text"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleFilterChange}
            placeholder="ابحث بكود المستشفى أو الاسم أو المحافظة..."
            style={{ flex: 1, minWidth: 250, padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc" }}
          />
          <select name="governorate" value={filters.governorate} onChange={handleFilterChange} style={{ padding: "8px", borderRadius: 4, border: "1px solid #ccc" }}>
            <option value="">جميع المحافظات</option>
            {governorates.map((gov) => (
              <option key={gov} value={gov}>{gov}</option>
            ))}
          </select>
          <input
            type="number"
            name="minIcuBeds"
            value={filters.minIcuBeds}
            onChange={handleFilterChange}
            placeholder="حد أدنى لأسرة رعاية مركزة"
            style={{ width: 200, padding: "8px", borderRadius: 4, border: "1px solid #ccc" }}
          />
          <select
            name="hasPediatricBeds"
            value={filters.hasPediatricBeds}
            onChange={handleFilterChange}
            style={{ padding: "8px", borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="">كل المستشفيات</option>
            <option value="yes">يوجد رعاية أطفال</option>
            <option value="no">لا يوجد رعاية أطفال</option>
          </select>
          <button onClick={resetFilters} style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}>
            🔄 إعادة تعيين
          </button>
        </div>
      </div>

      {/* 📋 الجدول */}
      <div style={{ backgroundColor: "white", padding: 20, borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <p style={{ fontWeight: "bold" }}>📊 إجمالي المستشفيات: {allHospitals.length} | المعروضة: {hospitals.length}</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "white" }}>
                <th>كود المستشفى</th>
                <th>اسم المستشفى</th>
                <th>المحافظة</th>
                <th>رعاية مركزة</th>
                <th>رعاية أطفال</th>
                <th>حضانات</th>
                <th>حديثي الولادة</th>
                <th>رعاية متوسطة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.length > 0 ? (
                hospitals.map((h, i) => (
                    <tr key={h.id} style={{ backgroundColor: i % 2 === 0 ? "#f8f9fa" : "#fff" }}>
                    <td>
                      {editingHospital?.id === h.id ? (
                        <input type="text" value={editingHospital.code} onChange={(e) => setEditingHospital({ ...editingHospital, code: e.target.value })} />
                      ) : h.code}
                    </td>
                    <td>
                      {editingHospital?.id === h.id ? (
                        <input type="text" value={editingHospital.name} onChange={(e) => setEditingHospital({ ...editingHospital, name: e.target.value })} />
                      ) : h.name}
                    </td>
                    <td>
                      {editingHospital?.id === h.id ? (
                        <select value={editingHospital.governorate} onChange={(e) => setEditingHospital({ ...editingHospital, governorate: e.target.value })}>
                          <option value="">اختر المحافظة</option>
                          {governorates.map((gov) => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                      ) : h.governorate}
                    </td>
                    <td>
                      {editingHospital?.id === h.id ? (
                        <input type="number" value={editingHospital.icuBeds} onChange={(e) => setEditingHospital({ ...editingHospital, icuBeds: parseInt(e.target.value) })} />
                      ) : h.icuBeds}
                    </td>
                    <td>
                      {editingHospital?.id === h.id ? (
                        <input type="number" value={editingHospital.pediatricBeds} onChange={(e) => setEditingHospital({ ...editingHospital, pediatricBeds: parseInt(e.target.value) })} />
                      ) : h.pediatricBeds}
                    </td>
                    <td>
                      {editingHospital?.id === h.id ? (
                        <input type="number" value={editingHospital.incubators} onChange={(e) => setEditingHospital({ ...editingHospital, incubators: parseInt(e.target.value) })} />
                      ) : h.incubators}
                    </td>
                    <td>
                      {editingHospital?.id === h.id ? (
                        <input type="number" value={editingHospital.newbornBeds} onChange={(e) => setEditingHospital({ ...editingHospital, newbornBeds: parseInt(e.target.value) })} />
                      ) : h.newbornBeds}
                    </td>
                    <td>
                      {editingHospital?.id === h.id ? (
                        <input type="number" value={editingHospital.mediumCareBeds} onChange={(e) => setEditingHospital({ ...editingHospital, mediumCareBeds: parseInt(e.target.value) })} />
                      ) : h.mediumCareBeds}
                    </td>
                    <td>
                      {currentRole === 'system_admin' || currentRole === 'hospital_admin' ? (
                        editingHospital?.id === h.id ? (
                          <>
                            <button onClick={saveEdit} style={{ backgroundColor: "#28a745", color: "#fff", marginRight: 5 }}>💾 حفظ</button>
                            <button onClick={() => setEditingHospital(null)} style={{ backgroundColor: "#6c757d", color: "#fff" }}>❌ إلغاء</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(h)} style={{ backgroundColor: "#ffc107", marginRight: 5 }}>✏️ تعديل</button>
                            <button onClick={() => handleDelete(h.id)} style={{ backgroundColor: "#dc3545", color: "#fff" }}>🗑️ حذف</button>
                          </>
                        )
                      ) : (
                        <span style={{ color: '#6c757d' }}>محجوز للصلاحيات</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9">لا توجد بيانات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📌 Pagination */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} style={{ margin: "0 10px" }}>⬅️ السابق</button>
        <span> صفحة {page} </span>
        <button onClick={() => handlePageChange(page + 1)} disabled={hospitals.length < limit} style={{ margin: "0 10px" }}>التالي ➡️</button>
      </div>
    </div>
  );
};

export default HospitalManagement;
