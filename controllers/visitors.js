const Visitor = require("../models/Visitor");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

// Create a new visitor lead
const createVisitor = async (req, res) => {
  const { userName, email, status } = req.body;

  // Check if visitor with this email already exists
  const existingVisitor = await Visitor.findOne({ email });
  if (existingVisitor) {
    throw new BadRequestError("Visitor with this email already exists");
  }

  const visitor = await Visitor.create({
    userName,
    email,
    status: status || "New",
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Visitor lead created successfully",
    visitor,
  });
};

// Get all visitor leads
const getAllVisitors = async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;

  const queryObject = {};

  // Filter by status
  if (status) {
    queryObject.status = status;
  }

  // Search functionality
  if (search) {
    queryObject.$or = [
      { userName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const visitors = await Visitor.find(queryObject)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const totalVisitors = await Visitor.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    success: true,
    count: visitors.length,
    total: totalVisitors,
    page: Number(page),
    totalPages: Math.ceil(totalVisitors / limit),
    visitors,
  });
};

// Get single visitor lead
const getVisitor = async (req, res) => {
  const { id } = req.params;

  const visitor = await Visitor.findById(id);

  if (!visitor) {
    throw new NotFoundError(`No visitor found with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    visitor,
  });
};

// Update visitor lead
const updateVisitor = async (req, res) => {
  const { id } = req.params;
  const { userName, email, status } = req.body;

  // Check if visitor exists
  const existingVisitor = await Visitor.findById(id);
  if (!existingVisitor) {
    throw new NotFoundError(`No visitor found with id: ${id}`);
  }

  // If email is being updated, check if another visitor already has this email
  if (email && email !== existingVisitor.email) {
    const emailExists = await Visitor.findOne({
      email,
      _id: { $ne: id },
    });
    if (emailExists) {
      throw new BadRequestError(
        "Another visitor with this email already exists"
      );
    }
  }

  const visitor = await Visitor.findByIdAndUpdate(
    id,
    { userName, email, status },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Visitor lead updated successfully",
    visitor,
  });
};

// Delete visitor lead
const deleteVisitor = async (req, res) => {
  const { id } = req.params;

  const visitor = await Visitor.findByIdAndDelete(id);

  if (!visitor) {
    throw new NotFoundError(`No visitor found with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Visitor lead deleted successfully",
    visitor,
  });
};

// Get visitor statistics
const getVisitorStats = async (req, res) => {
  const totalVisitors = await Visitor.countDocuments();
  const newLeads = await Visitor.countDocuments({ status: "New" });
  const contactedLeads = await Visitor.countDocuments({ status: "Contacted" });
  const interestedLeads = await Visitor.countDocuments({
    status: "Interested",
  });
  const notInterestedLeads = await Visitor.countDocuments({
    status: "Not Interested",
  });
  const convertedLeads = await Visitor.countDocuments({ status: "Converted" });

  // Recent visitors (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentVisitors = await Visitor.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Monthly statistics
  const monthlyStats = await Visitor.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        statuses: {
          $push: "$status",
        },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    statistics: {
      total: totalVisitors,
      new: newLeads,
      contacted: contactedLeads,
      interested: interestedLeads,
      notInterested: notInterestedLeads,
      converted: convertedLeads,
      recentVisitors: recentVisitors,
      monthlyBreakdown: monthlyStats,
      conversionRate:
        totalVisitors > 0
          ? ((convertedLeads / totalVisitors) * 100).toFixed(2)
          : 0,
    },
  });
};

// Bulk operations
const bulkUpdateVisitorStatus = async (req, res) => {
  const { visitorIds, status } = req.body;

  if (!visitorIds || !Array.isArray(visitorIds) || visitorIds.length === 0) {
    throw new BadRequestError("Please provide valid visitor IDs");
  }

  if (!status) {
    throw new BadRequestError("Please provide status");
  }

  const result = await Visitor.updateMany(
    { _id: { $in: visitorIds } },
    { status },
    { runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Updated ${result.modifiedCount} visitor leads`,
    modifiedCount: result.modifiedCount,
  });
};

module.exports = {
  createVisitor,
  getAllVisitors,
  getVisitor,
  updateVisitor,
  deleteVisitor,
  getVisitorStats,
  bulkUpdateVisitorStatus,
};
