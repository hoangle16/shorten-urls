const dataNormalization = (req, res, next) => {
  if (req.body) {
    req.body = normalizeData(req.body);
  }

  if (req.query) {
    req.query = normalizeData(req.query);
  }

  if (req.params) {
    req.params = normalizeData(req.params);
  }

  next();
};

const normalizeData = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (value === "true") return true;
  if (value === "false") return false;

  if (typeof value === "string" && !isNaN(value) && value.trim() !== "") {
    if (Number.isInteger(Number(value))) {
      return parseInt(value, 10);
    }

    return parseFloat(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeData(item));
  }

  if (typeof value === "object") {
    const normalized = {};
    for (const key in value) {
      normalized[key] = normalizeData(value[key]);
    }
    return normalized;
  }

  return value;
};

module.exports = dataNormalization;
