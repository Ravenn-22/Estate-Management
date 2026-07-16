const prisma = require('../config/prisma');
const uploadBufferToCloudinary = require('../utils/cloudinaryUpload');

const uploadDocument = async (req, res) => {
  try {
    const { type, unitId, tenantId } = req.body;

    if (!type || !req.file) {
      return res.status(400).json({ error: 'Type and file are required' });
    }

    const validTypes = ['LEASE', 'RECEIPT', 'NOTICE', 'RULES'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    const fileUrl = await uploadBufferToCloudinary(req.file.buffer, 'estate-platform/documents');

    const document = await prisma.document.create({
      data: { type, unitId: unitId || null, tenantId: tenantId || null, fileUrl },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      include: { unit: true, tenant: { select: { id: true, name: true } } },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { tenantId: req.user.id },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { uploadDocument, getAllDocuments, getMyDocuments };