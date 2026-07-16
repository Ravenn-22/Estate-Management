const prisma = require("../config/prisma");
const uploadBufferToCloudinary = require("../utils/cloudinaryUpload");

const createRequest = async (req, res) => {
  try {
    const { unitId, category, description, priority, preferredTime } = req.body;

    if (!unitId || !category || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      photoUrls = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file.buffer)),
      );
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        tenantId: req.user.id,
        unitId,
        category,
        description,
        priority: priority || "MEDIUM",
        preferredTime: preferredTime ? new Date(preferredTime) : null,
        photoUrls,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
const getAllRequests = async (req, res) => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        unit: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      where: { tenantId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: { status },
    });

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  updateRequestStatus,
};
