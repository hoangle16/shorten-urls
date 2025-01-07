const redisClient = require("../../config/redis");
const geoip = require("geoip-lite");

jest.mock("../../config/redis", () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));

jest.mock("geoip-lite");

const {
  cacheGetOrSet,
  updateCacheAfterModification,
  checkLinkExpiry,
  generateShortLink,
  generateVerificationToken,
  CustomError,
  getCountryFromIP,
} = require("../../helpers/utils");

describe("utils.js", () => {
  describe("cacheGetOrSet", () => {
    it("should return cached data if available", async () => {
      redisClient.get.mockResolvedValueOnce('{"someKey":"someValue"}'); // Mock redisClient.get to return cached data

      const result = await cacheGetOrSet("someKey", jest.fn()); // Mock fetchFunc
      expect(result).toEqual({ someKey: "someValue" });
      expect(redisClient.get).toHaveBeenCalledWith("someKey");
    });

    it("should fetch and cache data if not cached", async () => {
      redisClient.get.mockResolvedValueOnce(null); // No cached data
      redisClient.set.mockResolvedValueOnce(true); // Mock redisClient.set to simulate saving cache

      const fetchFunc = jest.fn().mockResolvedValue({ someKey: "newData" });
      const result = await cacheGetOrSet("someKey", fetchFunc);

      expect(result).toEqual({ someKey: "newData" });
      expect(redisClient.set).toHaveBeenCalledWith(
        "someKey",
        '{"someKey":"newData"}'
      );
      expect(fetchFunc).toHaveBeenCalled();
    });
  });

  describe("updateCacheAfterModification", () => {
    it("should delete old cache and set new data", async () => {
      redisClient.del.mockResolvedValueOnce(true); // Mock redisClient.del
      redisClient.set.mockResolvedValueOnce(true); // Mock redisClient.set

      const fetchFunc = jest.fn().mockResolvedValue({ updatedData: true });
      const result = await updateCacheAfterModification("someKey", fetchFunc);

      expect(result).toEqual({ updatedData: true });
      expect(redisClient.del).toHaveBeenCalledWith("someKey");
      expect(redisClient.set).toHaveBeenCalledWith(
        "someKey",
        '{"updatedData":true}'
      );
      expect(fetchFunc).toHaveBeenCalled();
    });
  });

  describe("checkLinkExpiry", () => {
    it("should return true if the link is expired", async () => {
      const link = { expiryDate: new Date(Date.now() - 10000).toISOString() };

      const key = "someKey";
      redisClient.del.mockResolvedValueOnce(true);

      const result = await checkLinkExpiry(link, key);
      expect(result).toBe(true);
      expect(redisClient.del).toHaveBeenCalledWith(key);
    });

    it("should return false if the link is not expired", async () => {
      const link = { expiryDate: new Date(Date.now() + 10000).toISOString() };
      const key = "someKey";
      redisClient.del.mockResolvedValueOnce(false);

      const result = await checkLinkExpiry(link, key);
      expect(result).toBe(false);
      expect(redisClient.del).toHaveBeenCalledWith(key);
    });
  });

  describe("generateShortLink", () => {
    it("should generate the base URL from request", () => {
      const req = {
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost"),
        originalUrl: "/short-code",
      };

      const result = generateShortLink(req);
      expect(result).toBe("http://localhost/short-code");
    });
  });

  describe("generateVerificationToken", () => {
    it("should generate a random verification token", () => {
      const token = generateVerificationToken();
      expect(token).toHaveLength(64);
    });
  });

  describe("CustomError", () => {
    it("should create an error with custom message and status code", () => {
      const error = new CustomError("Not found", 404);
      expect(error.message).toBe("Not found");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("getCountryFromIP", () => {
    it("should return country if geoip lookup is successful", () => {
      geoip.lookup.mockReturnValueOnce({ country: "US" });
      const result = getCountryFromIP("127.0.0.1");
      expect(result).toBe("US");
    });

    it("should return 'Unknown' if geoip lookup is unsuccessful", () => {
      geoip.lookup.mockReturnValueOnce(null);
      const result = getCountryFromIP("127.0.0.1");
      expect(result).toBe("Unknown");
    });
  });
});
