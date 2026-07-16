const prisma = require('../config/prisma');

const createInvoice = async (req, res) => {
  try {
    const { leaseId, amount, dueDate } = req.body;

    if (!leaseId || !amount || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
    if (!lease || lease.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Invalid or inactive lease' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        leaseId,
        amount,
        dueDate: new Date(dueDate),
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        lease: { include: { tenant: { select: { id: true, name: true } }, unit: true } },
        payments: true,
      },
      orderBy: { dueDate: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getMyInvoices = async (req, res) => {
  try {
    const lease = await prisma.lease.findFirst({
      where: { tenantId: req.user.id, status: 'ACTIVE' },
    });

    if (!lease) {
      return res.status(404).json({ error: 'No active lease found' });
    }

    const invoices = await prisma.invoice.findMany({
      where: { leaseId: lease.id },
      include: { payments: true },
      orderBy: { dueDate: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { createInvoice, getInvoices, getMyInvoices };