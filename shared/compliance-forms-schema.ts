import { pgTable, serial, varchar, text, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Countries table - Master list of importing countries
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  countryCode: varchar("country_code", { length: 3 }).unique().notNull(),
  countryName: varchar("country_name", { length: 100 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  importAgencyName: varchar("import_agency_name", { length: 200 }),
  agencyWebsite: varchar("agency_website", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow()
});

// Compliance forms table - All import forms by country
export const complianceForms = pgTable("compliance_forms", {
  id: serial("id").primaryKey(),
  countryId: integer("country_id").references(() => countries.id).notNull(),
  formCode: varchar("form_code", { length: 50 }).notNull(),
  formName: varchar("form_name", { length: 200 }).notNull(),
  formDescription: text("form_description"),
  formUrl: varchar("form_url", { length: 500 }),
  pdfUrl: varchar("pdf_url", { length: 500 }),
  requiredFor: jsonb("required_for").$type<string[]>(), // ["passenger_cars", "commercial", "classic", "motorcycle"]
  mandatory: boolean("mandatory").default(true),
  processingTimeDays: integer("processing_time_days"),
  fees: jsonb("fees").$type<{
    amount: number;
    currency: string;
    description: string;
  }>(),
  lastVerified: date("last_verified"),
  createdAt: timestamp("created_at").defaultNow()
});

// Form fields table - Individual field requirements for each form
export const formFields = pgTable("form_fields", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => complianceForms.id).notNull(),
  fieldName: varchar("field_name", { length: 100 }).notNull(),
  fieldType: varchar("field_type", { length: 50 }).notNull(), // text, number, date, dropdown, file_upload
  required: boolean("required").default(false),
  description: text("description"),
  exampleValue: varchar("example_value", { length: 200 }),
  validationRules: jsonb("validation_rules").$type<{
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    options?: string[];
  }>()
});

// Import processes table - Step-by-step import procedures
export const importProcesses = pgTable("import_processes", {
  id: serial("id").primaryKey(),
  countryId: integer("country_id").references(() => countries.id).notNull(),
  stepNumber: integer("step_number").notNull(),
  stepName: varchar("step_name", { length: 200 }).notNull(),
  stepDescription: text("step_description"),
  requiredForms: jsonb("required_forms").$type<number[]>(), // array of form_ids
  estimatedTimeDays: integer("estimated_time_days"),
  costEstimate: jsonb("cost_estimate").$type<{
    amount: number;
    currency: string;
    description: string;
  }>(),
  dependencies: text("dependencies"), // what must be completed before this step
  notes: text("notes")
});

// Document requirements table - Supporting documents needed
export const documentRequirements = pgTable("document_requirements", {
  id: serial("id").primaryKey(),
  countryId: integer("country_id").references(() => countries.id).notNull(),
  documentName: varchar("document_name", { length: 200 }).notNull(),
  documentDescription: text("document_description"),
  originalRequired: boolean("original_required").default(false),
  notarizationRequired: boolean("notarization_required").default(false),
  translationRequired: boolean("translation_required").default(false),
  apostilleRequired: boolean("apostille_required").default(false),
  validityPeriodDays: integer("validity_period_days"),
  issuingAuthority: varchar("issuing_authority", { length: 200 })
});

// Form verification tracking - Monitor form changes and updates
export const formVerifications = pgTable("form_verifications", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => complianceForms.id).notNull(),
  verificationDate: date("verification_date").notNull(),
  verificationStatus: varchar("verification_status", { length: 20 }).notNull(), // "active", "updated", "deprecated", "broken_link"
  changes: text("changes"), // description of any changes found
  verifiedBy: varchar("verified_by", { length: 100 }) // automated system or manual reviewer
});

// Define relations
export const countriesRelations = relations(countries, ({ many }) => ({
  complianceForms: many(complianceForms),
  importProcesses: many(importProcesses),
  documentRequirements: many(documentRequirements)
}));

export const complianceFormsRelations = relations(complianceForms, ({ one, many }) => ({
  country: one(countries, {
    fields: [complianceForms.countryId],
    references: [countries.id]
  }),
  formFields: many(formFields),
  verifications: many(formVerifications)
}));

export const formFieldsRelations = relations(formFields, ({ one }) => ({
  form: one(complianceForms, {
    fields: [formFields.formId],
    references: [complianceForms.id]
  })
}));

export const importProcessesRelations = relations(importProcesses, ({ one }) => ({
  country: one(countries, {
    fields: [importProcesses.countryId],
    references: [countries.id]
  })
}));

export const documentRequirementsRelations = relations(documentRequirements, ({ one }) => ({
  country: one(countries, {
    fields: [documentRequirements.countryId],
    references: [countries.id]
  })
}));

export const formVerificationsRelations = relations(formVerifications, ({ one }) => ({
  form: one(complianceForms, {
    fields: [formVerifications.formId],
    references: [complianceForms.id]
  })
}));

// Zod schemas for validation
export const insertCountrySchema = createInsertSchema(countries);
export const selectCountrySchema = createSelectSchema(countries);
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = z.infer<typeof selectCountrySchema>;

export const insertComplianceFormSchema = createInsertSchema(complianceForms);
export const selectComplianceFormSchema = createSelectSchema(complianceForms);
export type InsertComplianceForm = z.infer<typeof insertComplianceFormSchema>;
export type ComplianceForm = z.infer<typeof selectComplianceFormSchema>;

export const insertFormFieldSchema = createInsertSchema(formFields);
export const selectFormFieldSchema = createSelectSchema(formFields);
export type InsertFormField = z.infer<typeof insertFormFieldSchema>;
export type FormField = z.infer<typeof selectFormFieldSchema>;

export const insertImportProcessSchema = createInsertSchema(importProcesses);
export const selectImportProcessSchema = createSelectSchema(importProcesses);
export type InsertImportProcess = z.infer<typeof insertImportProcessSchema>;
export type ImportProcess = z.infer<typeof selectImportProcessSchema>;

export const insertDocumentRequirementSchema = createInsertSchema(documentRequirements);
export const selectDocumentRequirementSchema = createSelectSchema(documentRequirements);
export type InsertDocumentRequirement = z.infer<typeof insertDocumentRequirementSchema>;
export type DocumentRequirement = z.infer<typeof selectDocumentRequirementSchema>;

export const insertFormVerificationSchema = createInsertSchema(formVerifications);
export const selectFormVerificationSchema = createSelectSchema(formVerifications);
export type InsertFormVerification = z.infer<typeof insertFormVerificationSchema>;
export type FormVerification = z.infer<typeof selectFormVerificationSchema>;