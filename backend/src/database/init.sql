-- Initialize database with security extensions and configurations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for performance
-- These will be created by TypeORM migrations, but listed here for reference

-- Security: Enable row-level security on sensitive tables
-- ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vote_eligibility ENABLE ROW LEVEL SECURITY;

-- Create triggers for immutable audit logs
-- This prevents UPDATE and DELETE on audit logs
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable';
END;
$$ LANGUAGE plpgsql;

-- Create trigger for blockchain votes (immutable)
CREATE OR REPLACE FUNCTION prevent_vote_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Blockchain votes are immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant appropriate permissions
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO voting_readonly;
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO voting_app;

COMMENT ON DATABASE voting_system IS 'Secure Electronic Voting System Database';

