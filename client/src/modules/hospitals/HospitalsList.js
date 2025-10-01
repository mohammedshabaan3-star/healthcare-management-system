// client/src/modules/hospitals/HospitalsList.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const HospitalsList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    governorate: '',
    icuBeds: '',
    pediatricBeds: '',
    incubators: '',
    newbornBeds: '',
    mediumCareBeds: ''
  });
  const [governorates, setGovernorates] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAll, setTotalAll] = useState(0);
  const [totalFiltered, setTotalFiltered] = useState(0);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hospitals', {
        params: { ...filters, page, limit }
      });

      setHospitals(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalAll(res.data.totalAll);
      setTotalFiltered(res.data.totalFiltered);

      // استخراج المحافظات
      const uniqueGovernorates = [
        ...new Set(res.data.data.map(h => h.governorate).filter(Boolean))
      ];
      setGovernorates(uniqueGovernorates);

      setLoading(false);
    } catch (error) {
      console.error('فشل في جلب المستشفيات:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [filters, page]);

  const handleFilterChange = (e) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      governorate: '',
      icuBeds: '',
      pediatricBeds: '',
      incubators: '',
      newbornBeds: '',
      mediumCareBeds: ''
    });
    setPage(1);
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>⏳ جارٍ التحميل...</div>;

  return (
    <div style={{ padding: 20, direction: 'rtl' }}>
      <h2 style={{ textAlign: 'center', color: '#007bff' }}>🏥 قائمة المستشفيات</h2>

      {/* البحث والفلاتر */}
      <div style={{ backgroundColor: 'white', padding: 20, marginBottom: 20, borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
        <h3>🔍 البحث والفلاتر</h3>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="ابحث بالاسم أو الكود أو المحافظة..."
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 10 }}>
          <select name="governorate" value={filters.governorate} onChange={handleFilterChange}>
            <option value="">كل المحافظات</option>
            {governorates.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input name="icuBeds" value={filters.icuBeds} onChange={handleFilterChange} placeholder="حد أدنى ICU" type="number" />
          <input name="pediatricBeds" value={filters.pediatricBeds} onChange={handleFilterChange} placeholder="حد أدنى أطفال" type="number" />
          <input name="incubators" value={filters.incubators} onChange={handleFilterChange} placeholder="حد أدنى حضانات" type="number" />
          <input name="newbornBeds" value={filters.newbornBeds} onChange={handleFilterChange} placeholder="حد أدنى حديثي الولادة" type="number" />
          <input name="mediumCareBeds" value={filters.mediumCareBeds} onChange={handleFilterChange} placeholder="حد أدنى رعاية متوسطة" type="number" />
        </div>

        <button onClick={resetFilters} style={{ marginTop: 10, padding: '8px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}>🔄 إعادة تعيين</button>
      </div>

      {/* الإحصائيات */}
      <p>📊 إجمالي المستشفيات: {totalAll} | بعد الفلترة: {totalFiltered}</p>

      {/* الجدول */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#007bff', color: 'white' }}>
              <th>الكود</th>
              <th>الاسم</th>
              <th>المحافظة</th>
              <th>ICU</th>
              <th>أطفال</th>
              <th>حضانات</th>
              <th>حديثي الولادة</th>
              <th>رعاية متوسطة</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.length > 0 ? hospitals.map(h => (
              <tr key={h.id}>
                <td>{h.code}</td>
                <td>{h.name}</td>
                <td>{h.governorate}</td>
                <td>{h.icuBeds}</td>
                <td>{h.pediatricBeds}</td>
                <td>{h.incubators}</td>
                <td>{h.newbornBeds}</td>
                <td>{h.mediumCareBeds}</td>
              </tr>
            )) : (
              <tr><td colSpan="8">لا توجد بيانات</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>⬅️ السابق</button>
        <span style={{ margin: '0 10px' }}>صفحة {page} من {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>➡️ التالي</button>
      </div>
    </div>
  );
};

export default HospitalsList;
