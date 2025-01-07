import * as yup from "yup";

export const linkSchema = yup.object().shape({
  originalUrl: yup
    .string()
    .required("URL is required")
    .url("Please enter a valid URL"),

  customAddress: yup
    .string()
    .nullable()
    .notRequired()
    .when({
      is: (value) => value !== null && value !== "",
      then: (schema) =>
        schema
          .min(4, "Custom address must be at least 4 characters")
          .max(32, "Custom address must be at most 32 characters"),
    }),

  password: yup
    .string()
    .nullable()
    .notRequired()
    .when({
      is: (value) => value !== null && value !== "",
      then: (schema) =>
        schema
          .min(4, "Password must be at least 4 characters")
          .max(16, "Password must be at most 16 characters"),
    }),

  expiryDate: yup.string().nullable().notRequired().trim(),

  description: yup
    .string()
    .nullable()
    .notRequired()
    .trim()
    .max(1024, "Description must be at most 1024 characters"),

  domainId: yup
    .string()
    .nullable()
    .length(24, "DomainId must be 24 characters long")
    .required("DomainId is required."),
});
