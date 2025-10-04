import express from 'express';
const router = express.Router();

// Mock data for care types
const careTypes = [
  { id: 1, name: 'General Care' },
  { id: 2, name: 'Specialized Care' },
  { id: 3, name: 'Emergency Care' },
];

// GET /api/care-types
router.get('/', (req, res) => {
  res.status(200).json(careTypes);
});

export default router;