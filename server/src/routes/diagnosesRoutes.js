import express from 'express';
const router = express.Router();

// Mock data for diagnoses
const diagnoses = [
  { id: 1, name: 'Diagnosis A' },
  { id: 2, name: 'Diagnosis B' },
  { id: 3, name: 'Diagnosis C' },
];

// GET /api/diagnoses
router.get('/', (req, res) => {
  res.status(200).json(diagnoses);
});

export default router;