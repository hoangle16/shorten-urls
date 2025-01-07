const { param, body } = require("express-validator");

const domainIdValidate = [
  param("domainId", "domainId is invalid").isLength({ min: 24, max: 24 }),
];

const domainNameValidate = [
  body("domain", "Domain url is invalid").isURL({
    require_protocol: true,
    require_tld: false,
    allow_underscores: false,
    allow_ports: true,
  }),
];

module.exports = { domainIdValidate, domainNameValidate };
