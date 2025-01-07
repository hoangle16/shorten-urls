const Domain = require("../models/Domain");
const { CustomError } = require("../helpers/utils");

const getDomains = async () => await Domain.find({});

const getDomainById = async (domainId) => {
  const domain = await Domain.findById(domainId);
  if (!domain) {
    throw new CustomError("Domain not found", 404);
  }
  return domain;
};

const createDomain = async (domain) => {
  const existingDomain = await Domain.findOne({ domain });
  if (existingDomain) {
    throw new CustomError("Domain already exists", 400);
  }
  const newDomain = new Domain({ domain });
  await newDomain.save();
  return newDomain;
};

const updateDomain = async (domainId, updatedDomain) => {
  const existingDomain = await Domain.findOne({ domain: updatedDomain });
  if (existingDomain && existingDomain._id.toString() !== domainId) {
    throw new CustomError("Domain already exists", 400);
  }
  const domain = await Domain.findByIdAndUpdate(
    domainId,
    { domain: updatedDomain },
    {
      new: true,
    }
  );
  if (!domain) {
    throw new CustomError("Domain not found", 404);
  }
  return domain;
};

const deleteDomain = async (domainId) => {
  const domain = await Domain.findByIdAndDelete(domainId);
  if (!domain) {
    throw new CustomError("Domain not found", 404);
  }
  return domain;
};

module.exports = {
  getDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
};
