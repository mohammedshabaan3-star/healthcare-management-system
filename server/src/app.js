import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { Sequelize } from 'sequelize';
import connectSessionSequelize from 'connect-session-sequelize';

// Routes
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import governorateRoutes from './routes/governorateRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import standardRoutes from './routes/standardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import careTypesRoutes from './routes/careTypesRoutes.js';
import icuClassesRoutes from './routes/icuClassesRoutes.js';
import diagnosesRoutes from './routes/diagnosesRoutes.js';

// Seeds
import { seedGovernoratesAndDistricts } from './services/seedGovernorates.js';
import { seedHospitals } from './services/seedHospitals.js';
import { createAdminUserIfNotExists } from './services/seedAdmin.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS مع السماح بالكوكيز
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Initialize Sequelize with DATABASE_URL when provided (production),
// otherwise fall back to a lightweight sqlite DB for local development.
let sequelize;
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false });
} else {
    // fallback to sqlite file to allow local dev without a Postgres URL
    sequelize = new Sequelize({ dialect: 'sqlite', storage: './dev.sqlite', logging: false });
}
const SequelizeStore = connectSessionSequelize(session.Store);
const store = new SequelizeStore({ db: sequelize });

app.use(session({
    secret: process.env.SESSION_SECRET || 'super_secret_12345!',
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24*60*60*1000
    }
}));
store.sync();

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/governorates', governorateRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/standards', standardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/care-types', careTypesRoutes);
app.use('/api/icu-classes', icuClassesRoutes);
app.use('/api/diagnoses', diagnosesRoutes);

app.get('/health', (req,res) => res.json({ status:'OK', message:'Healthcare System running!' }));

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await createAdminUserIfNotExists();
    await seedGovernoratesAndDistricts();
    await seedHospitals();
});
