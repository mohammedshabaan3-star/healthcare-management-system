import express from 'express';
const router = express.Router();

// Mock data for ICU classes
const icuClasses = [
  { id: 1, name: 'Class A' },
  { id: 2, name: 'Class B' },
  { id: 3, name: 'Class C' },
];

// GET /api/icu-classes
router.get('/', (req, res) => {
  res.status(200).json(icuClasses);
});

export default router;