const { UnauthenticatedError } = require("../errors");
const Staff = require("../models/Staff");

// Middleware to check if user has required role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthenticatedError("Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new UnauthenticatedError(
        `Access denied. Required roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
};

// Middleware to check staff permissions for specific actions
const requireStaffPermission = (module, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      throw new UnauthenticatedError("Authentication required");
    }

    // Admin always has access
    if (req.user.role === "admin") {
      return next();
    }

    // For staff members, check their authorities
    if (req.user.role === "staff") {
      try {
        const staff = await Staff.findById(req.user.userId);
        if (!staff) {
          throw new UnauthenticatedError("Staff member not found");
        }

        // Check if staff has the required permission
        if (staff.authorities[module] && staff.authorities[module][action]) {
          // Attach staff authorities to request for use in controllers
          req.user.authorities = staff.authorities;
          return next();
        } else {
          throw new UnauthenticatedError(
            `Insufficient permissions for ${module} ${action}`
          );
        }
      } catch (error) {
        throw new UnauthenticatedError("Permission check failed");
      }
    }

    throw new UnauthenticatedError("Access denied");
  };
};

// Middleware to check if user can access their own resource or if admin
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    throw new UnauthenticatedError("Authentication required");
  }

  const resourceId = req.params.id;

  // Admin can access any resource
  if (req.user.role === "admin") {
    return next();
  }

  // User can only access their own resource
  if (req.user.userId === resourceId) {
    return next();
  }

  throw new UnauthenticatedError(
    "Access denied. You can only access your own resources."
  );
};

module.exports = {
  requireRole,
  requireStaffPermission,
  requireOwnershipOrAdmin,
};
