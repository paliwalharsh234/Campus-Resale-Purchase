const ApiError = require('../utils/ApiError');

/**
 * Campus-isolation middleware.
 * MUST run after `authenticate`.
 *
 * Injects req.campusFilter = { campus: req.user.campusId } so
 * every controller query is automatically scoped to the caller's campus.
 *
 * Even if a malicious user manipulates query params or body to supply a
 * different campus ID, the campusFilter always wins.
 */
const campusIsolation = (req, _res, next) => {
  if (!req.user || !req.user.campusId) {
    return next(ApiError.unauthorized('Campus context missing.'));
  }
  req.campusFilter = { campus: req.user.campusId };
  next();
};

module.exports = campusIsolation;
