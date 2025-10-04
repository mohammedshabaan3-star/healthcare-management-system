// client/src/modules/patients/PatientRegistrationForm.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const PatientRegistrationForm = () => {
    const [formData, setFormData] = useState({
        // البيانات الأساسية
        reportNumber: '',
        reportDate: '',
        reportTime: '',
        fullName: '',
        nationalId: '',
        age: '',
        gender: '',
        governorate: '',
        address: '',
        phone1: '',
        phone2: '',
        
        // بيانات الدخول والتحويل
        referralSource: '', // المستشفى الحالي
        sameHospital: true,
        transferToOther: false,
        transferHospital: '', // المستشفى المراد التحويل إليها
        transferReason: '',
        directTransfer: false,
        
        // البيانات الطبية
        doctorName: '',
        careType: '',
        admissionDate: '',
        admissionTime: '',
        apacheScore: '',
        initialDiagnosis: '',
        additionalServices: '',
        vent: false,
        icuClass: '',
        
        // ملاحظات
        notes: ''
    });

    const [governorates, setGovernorates] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [careTypes, setCareTypes] = useState([]);
    const [icuClasses, setIcuClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // جلب البيانات من الخادم عند التحميل
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [govRes, hospRes, diagRes, careRes, icuRes] = await Promise.all([
                    api.get('/governorates', { withCredentials: true }),
                    api.get('/hospitals', { withCredentials: true }),
                    api.get('/diagnoses', { withCredentials: true }),
                    api.get('/care-types', { withCredentials: true }),
                    api.get('/icu-classes', { withCredentials: true })
                ]);
                setGovernorates(govRes.data.map(g => g.name));
                setHospitals(hospRes.data.map(h => h.name));
                setDiagnoses(diagRes.data);
                setCareTypes(careRes.data);
                setIcuClasses(icuRes.data);
                setLoading(false);
            } catch (error) {
                console.error('فشل في جلب البيانات:', error);
                setMessage('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // حساب العمر والجنس من الرقم القومي
    const handleNationalIdChange = (e) => {
        const id = e.target.value;
        setFormData(prev => ({ ...prev, nationalId: id }));

        if (id.length === 14 && (id[0] === '2' || id[0] === '3')) {
            // حساب العمر
            const century = id[0] === '2' ? 1900 : 2000;
            const year = century + parseInt(id.substring(1, 3));
            const month = parseInt(id.substring(3, 5));
            const day = parseInt(id.substring(5, 7));
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // تحديد الجنس
            const genderDigit = parseInt(id.charAt(12));
            const gender = genderDigit % 2 === 0 ? 'أنثى' : 'ذكر';

            setFormData(prev => ({ ...prev, age, gender }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const response = await api.post('/patients', formData);

            setMessage('✅ تم تسجيل المريض بنجاح' + (formData.directTransfer ? ' وتم إرسال طلب التحويل للموافقة' : ''));
            
            // إعادة تعيين النموذج
            setFormData({
                reportNumber: '',
                reportDate: '',
                reportTime: '',
                fullName: '',
                nationalId: '',
                age: '',
                gender: '',
                governorate: '',
                address: '',
                phone1: '',
                phone2: '',
                referralSource: '',
                sameHospital: true,
                transferToOther: false,
                transferHospital: '',
                transferReason: '',
                directTransfer: false,
                doctorName: '',
                careType: '',
                admissionDate: '',
                admissionTime: '',
                apacheScore: '',
                initialDiagnosis: '',
                additionalServices: '',
                vent: false,
                icuClass: '',
                notes: ''
            });
        } catch (error) {
            setMessage('❌ فشل في تسجيل المريض: ' + error.response?.data?.error || error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl' }}>جارٍ التحميل...</div>;
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff' }}>تسجيل مريض جديد</h2>
            {message && <div style={{ padding: '10px', margin: '10px 0', backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da', color: message.includes('✅') ? '#155724' : '#721c24', border: '1px solid', borderRadius: '5px' }}>{message}</div>}
            
            <form onSubmit={handleSubmit}>
                {/* البيانات الأساسية */}
                <fieldset style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <legend>البيانات الأساسية</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                        <div>
                            <label>رقم البلاغ:</label>
                            <input type="text" name="reportNumber" value={formData.reportNumber} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label>تاريخ البلاغ:</label>
                            <input type="date" name="reportDate" value={formData.reportDate} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label>ساعة البلاغ:</label>
                            <input type="time" name="reportTime" value={formData.reportTime} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label>اسم المريض ثلاثي:</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label>الرقم القومي (14 رقمًا):</label>
                            <input 
                                type="text" 
                                name="nationalId" 
                                value={formData.nationalId} 
                                onChange={handleNationalIdChange} 
                                pattern="[23]\d{13}" 
                                title="يجب أن يبدأ بـ 2 أو 3 ويتكون من 14 رقمًا" 
                                required 
                            />
                        </div>
                        <div>
                            <label>السن (يُحسب تلقائيًا):</label>
                            <input type="number" name="age" value={formData.age} readOnly />
                        </div>
                        <div>
                            <label>النوع (يُحسب تلقائيًا):</label>
                            <input type="text" name="gender" value={formData.gender} readOnly />
                        </div>
                        <div>
                            <label>المحافظة:</label>
                            <select name="governorate" value={formData.governorate} onChange={handleInputChange} required>
                                <option value="">اختر المحافظة</option>
                                {governorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>محل الإقامة:</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label>رقم التليفون 1:</label>
                            <input 
                                type="tel" 
                                name="phone1" 
                                value={formData.phone1} 
                                onChange={handleInputChange} 
                                pattern="01[0125]\d{8}" 
                                title="يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015" 
                            />
                        </div>
                        <div>
                            <label>رقم التليفون 2:</label>
                            <input 
                                type="tel" 
                                name="phone2" 
                                value={formData.phone2} 
                                onChange={handleInputChange} 
                                pattern="01[0125]\d{8}" 
                                title="يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015" 
                            />
                        </div>
                        <div>
                            <label>مصدر التحويل (المستشفى الحالي):</label>
                            <select name="referralSource" value={formData.referralSource} onChange={handleInputChange} required>
                                <option value="">اختر المستشفى</option>
                                {hospitals.map(hosp => <option key={hosp} value={hosp}>{hosp}</option>)}
                            </select>
                        </div>
                    </div>
                </fieldset>

                {/* حالة الدخول والتحويل */}
                <fieldset style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <legend>حالة الدخول والتحويل</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="sameHospital" 
                                    checked={formData.sameHospital} 
                                    onChange={handleInputChange} 
                                />
                                دخول نفس المستشفى
                            </label>
                        </div>
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="transferToOther" 
                                    checked={formData.transferToOther} 
                                    onChange={handleInputChange} 
                                />
                                تحويل إلى مستشفى أخرى
                            </label>
                            {formData.transferToOther && (
                                <>
                                    <div style={{ marginTop: '10px' }}>
                                        <label>المستشفى المراد التحويل إليها:</label>
                                        <select 
                                            name="transferHospital" 
                                            value={formData.transferHospital} 
                                            onChange={handleInputChange} 
                                            required
                                        >
                                            <option value="">اختر المستشفى</option>
                                            {hospitals.map(hosp => <option key={hosp} value={hosp}>{hosp}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <label>سبب التحويل:</label>
                                        <textarea 
                                            name="transferReason" 
                                            value={formData.transferReason} 
                                            onChange={handleInputChange} 
                                            rows="3"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="directTransfer" 
                                    checked={formData.directTransfer} 
                                    onChange={handleInputChange} 
                                />
                                طلب تحويل مباشر (يتطلب موافقة)
                            </label>
                        </div>
                    </div>
                </fieldset>

                {/* البيانات الطبية */}
                <fieldset style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <legend>البيانات الطبية</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                        <div>
                            <label>اسم الطبيب:</label>
                            <input type="text" name="doctorName" value={formData.doctorName} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label>نوع الرعاية:</label>
                            <select name="careType" value={formData.careType} onChange={handleInputChange}>
                                <option value="">اختر نوع الرعاية</option>
                                {careTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>تاريخ الدخول:</label>
                            <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label>ساعة الدخول:</label>
                            <input type="time" name="admissionTime" value={formData.admissionTime} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label>APACHI ll Score:</label>
                            <select name="apacheScore" value={formData.apacheScore} onChange={handleInputChange}>
                                <option value="">اختر</option>
                                <option value="0-9">0-9: Low Risk</option>
                                <option value="10-19">10-19: Moderate Risk</option>
                                <option value="20-29">20-29: High Risk</option>
                                <option value="30+">30+: Very High Risk</option>
                            </select>
                        </div>
                        <div>
                            <label>التشخيص المبدئي:</label>
                            <select name="initialDiagnosis" value={formData.initialDiagnosis} onChange={handleInputChange}>
                                <option value="">اختر التشخيص</option>
                                {diagnoses.map(diag => <option key={diag} value={diag}>{diag}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>الخدمة الإضافية:</label>
                            <input type="text" name="additionalServices" value={formData.additionalServices} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="vent" 
                                    checked={formData.vent} 
                                    onChange={handleInputChange} 
                                />
                                Vent
                            </label>
                        </div>
                        <div>
                            <label>ICU Class:</label>
                            <select name="icuClass" value={formData.icuClass} onChange={handleInputChange}>
                                <option value="">اختر</option>
                                {icuClasses.map(icu => <option key={icu} value={icu}>{icu}</option>)}
                            </select>
                        </div>
                    </div>
                </fieldset>

                {/* ملاحظات */}
                <fieldset style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <legend>ملاحظات</legend>
                    <div>
                        <label>ملاحظات عامة:</label>
                        <textarea 
                            name="notes" 
                            value={formData.notes} 
                            onChange={handleInputChange} 
                            rows="3"
                            style={{ width: '100%' }}
                        />
                    </div>
                </fieldset>

                <button 
                    type="submit" 
                    disabled={submitting}
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        fontSize: '16px',
                        cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                >
                    {submitting ? 'جاري التسجيل...' : 'تسجيل المريض'}
                </button>
            </form>
        </div>
    );
};

export default PatientRegistrationForm;