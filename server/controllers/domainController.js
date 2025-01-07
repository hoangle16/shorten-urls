const domainService = require("../services/domainService");
const redisClient = require("../config/redis");
const {
  cacheGetOrSet,
  updateCacheAfterModification,
} = require("../helpers/utils");
const asyncHandler = require("express-async-handler");

const getDomains = asyncHandler(async (req, res) => {
  const domains = await cacheGetOrSet("domains", domainService.getDomains);
  res.json(domains);
});

const getDomainById = asyncHandler(async (req, res) => {
  const cacheKey = `domain:${req.params.domainId}`;
  const domain = await cacheGetOrSet(cacheKey, () =>
    domainService.getDomainById(req.params.domainId)
  );
  res.json(domain);
});

const createDomain = asyncHandler(async (req, res) => {
  const domain = await domainService.createDomain(req.body.domain);
  await redisClient.set(`domain:${domain.id}`, JSON.stringify(domain));
  await redisClient.del(`domains`);
  res.status(201).json(domain);
});

const updateDomain = asyncHandler(async (req, res) => {
  const domain = await domainService.updateDomain(
    req.params.domainId,
    req.body.domain
  );
  const cacheKey = `domain:${domain.id}`;
  await updateCacheAfterModification(cacheKey, () =>
    domainService.getDomainById(req.params.domainId)
  );
  await redisClient.del(`domains`);
  res.json(domain);
});

const deleteDomain = asyncHandler(async (req, res) => {
  await domainService.deleteDomain(req.params.domainId);
  await redisClient.del(`domain:${req.params.domainId}`);
  await redisClient.del(`domains`);
  res.status(204).send();
});

module.exports = {
  getDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
};
