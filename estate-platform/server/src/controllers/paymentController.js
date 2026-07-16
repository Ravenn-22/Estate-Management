const prisma = require('../config/prisma');

const recordPayment = async (req, res) => {
  try {
    const { invoiceId, amount, method, paystackRef, proofUrl } = req.body;

    if (!invoiceId || !amount || !method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const payment = await prisma.payment.create({
      data: { invoiceId, amount, method, paystackRef, proofUrl },
    });

    // Recalculate total paid so far, including this new payment
    const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(amount);
    const invoiceAmount = Number(invoice.amount);

    let newStatus = 'PENDING';
    if (totalPaid >= invoiceAmount) {
      newStatus = 'PAID';
    } else if (totalPaid > 0) {
      newStatus = 'PARTIAL';
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });

    res.status(201).json({ payment, invoiceStatus: newStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getPaymentsForInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paidAt: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { recordPayment, getPaymentsForInvoice };