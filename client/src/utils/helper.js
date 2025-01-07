export const generateQueryURL = (baseUrl, params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params)
    .filter(([_, value]) => value != null)
    .forEach(([key, value]) => searchParams.append(key, value));

  const queryString = searchParams.toString();

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
