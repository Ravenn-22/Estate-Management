const prisma = require('../config/prisma');

const createLease = async (req, res) => {
  try {
    const { tenantId, unitId, startDate, endDate, rentAmount } = req.body;

    if (!tenantId || !unitId || !startDate || !endDate || !rentAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Confirm tenant exists and is actually a TENANT
    const tenant = await prisma.user.findUnique({ where: { id: tenantId } });
    if (!tenant || tenant.role !== 'TENANT') {
      return res.status(400).json({ error: 'Invalid tenant' });
    }

    // Confirm unit exists and is vacant
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    if (unit.status !== 'VACANT') {
      return res.status(400).json({ error: 'Unit is not vacant' });
    }

    // Create lease + update unit status in a single transaction
    const [lease] = await prisma.$transaction([
      prisma.lease.create({
        data: {
          tenantId,
          unitId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          rentAmount,
        },
      }),
      prisma.unit.update({
        where: { id: unitId },
        data: { status: 'OCCUPIED' },
      }),
    ]);

    res.status(201).json(lease);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getLeases = async (req, res) => {
  try {
    const leases = await prisma.lease.findMany({
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        unit: true,
      },
    });

    res.json(leases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getMyLease = async (req, res) => {
  try {
    const lease = await prisma.lease.findFirst({
      where: { tenantId: req.user.id, status: 'ACTIVE' },
      include: { unit: true },
    });

    if (!lease) {
      return res.status(404).json({ error: 'No active lease found' });
    }

    res.json(lease);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const endLease = async (req, res) => {
  try {
    const { id } = req.params;

    const lease = await prisma.lease.findUnique({ where: { id } });
    if (!lease) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    await prisma.$transaction([
      prisma.lease.update({
        where: { id },
        data: { status: 'ENDED' },
      }),
      prisma.unit.update({
        where: { id: lease.unitId },
        data: { status: 'VACANT' },
      }),
    ]);

    res.json({ message: 'Lease ended, unit marked vacant' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { createLease, getLeases, getMyLease, endLease };