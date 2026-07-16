const prisma = require('../config/prisma');

const createAnnouncement = async (req, res) => {
  try {
    const { title, body, category } = req.body;

    if (!title || !body || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const announcement = await prisma.announcement.create({
      data: { title, body, category },
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { createAnnouncement, getAnnouncements };