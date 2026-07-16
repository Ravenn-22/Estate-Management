const prisma = require('../config/prisma');

const createUnit = async (req, res) => {
  try {
    const { label, rentAmount, bedrooms, bathrooms } = req.body;

    if (!label || !rentAmount) {
      return res.status(400).json({ error: 'Label and rentAmount are required' });
    }

    const unit = await prisma.unit.create({
      data: {
        label,
        rentAmount,
        bedrooms: bedrooms ? Number(bedrooms) : 1,
        bathrooms: bathrooms ? Number(bathrooms) : 1,
      },
    });

    res.status(201).json(unit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getUnits = async (req, res) => {
  try {
    const units = await prisma.unit.findMany({
      include: {
        leases: {
          where: { status: 'ACTIVE' },
          include: { tenant: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    res.json(units);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        leases: { include: { tenant: true } },
        maintenance: true,
        documents: true,
      },
    });

    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.json(unit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const updateUnitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['VACANT', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const unit = await prisma.unit.update({
      where: { id },
      data: { status },
    });

    res.json(unit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { createUnit, getUnits, getUnitById, updateUnitStatus };