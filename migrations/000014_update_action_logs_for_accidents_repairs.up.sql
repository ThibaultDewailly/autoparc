-- Update action_logs table to support new entity types
-- The action_logs table uses VARCHAR without CHECK constraints for entity_type and action_type
-- This provides flexibility to add new types without migrations
-- We only need to document the new supported types:

-- Supported entity_types (in addition to existing ones):
--   - 'garage': For garage management actions
--   - 'accident': For accident declaration and updates
--   - 'repair': For repair scheduling and tracking

-- Supported action_types (in addition to existing ones):
--   - 'status_change': For tracking status transitions (accidents, repairs)
--   - 'photo_upload': For accident photo uploads
--   - 'photo_delete': For accident photo deletions

-- No schema changes needed - action_logs table already supports these through VARCHAR fields
-- This migration serves as documentation for the new supported values
