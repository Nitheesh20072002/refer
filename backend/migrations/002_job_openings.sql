
-- Migration: Add Job Openings Feature
-- Date: 2024
-- Description: Creates tables for job openings and referral requests from openings

-- Create job_openings table
CREATE TABLE IF NOT EXISTS job_openings (
    id SERIAL PRIMARY KEY,
    posted_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posted_by_type VARCHAR(50) NOT NULL CHECK (posted_by_type IN ('individual', 'admin')),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    job_url VARCHAR(500),
    description TEXT,
    tech_stack VARCHAR(500),
    experience_level VARCHAR(50),
    location VARCHAR(255),
    salary VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired')),
    views INTEGER DEFAULT 0,
    referral_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create referral_requests_from_openings table
CREATE TABLE IF NOT EXISTS referral_requests_from_openings (
    id SERIAL PRIMARY KEY,
    opening_id INTEGER NOT NULL REFERENCES job_openings(id) ON DELETE CASCADE,
    requested_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    resume VARCHAR(500),
    cover_letter TEXT,
    notified_users TEXT, -- JSON array of user IDs who were notified
    accepted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_job_openings_posted_by ON job_openings(posted_by);
CREATE INDEX idx_job_openings_company_id ON job_openings(company_id);
CREATE INDEX idx_job_openings_status ON job_openings(status);
CREATE INDEX idx_job_openings_posted_by_type ON job_openings(posted_by_type);
CREATE INDEX idx_job_openings_deleted_at ON job_openings(deleted_at);

CREATE INDEX idx_referral_requests_from_openings_opening_id ON referral_requests_from_openings(opening_id);
CREATE INDEX idx_referral_requests_from_openings_requested_by ON referral_requests_from_openings(requested_by);
CREATE INDEX idx_referral_requests_from_openings_status ON referral_requests_from_openings(status);
CREATE INDEX idx_referral_requests_from_openings_accepted_by ON referral_requests_from_openings(accepted_by);
CREATE INDEX idx_referral_requests_from_openings_deleted_at ON referral_requests_from_openings(deleted_at);

-- Add unique constraint to prevent duplicate requests
CREATE UNIQUE INDEX idx_unique_opening_request ON referral_requests_from_openings(opening_id, requested_by)
WHERE deleted_at IS NULL;

-- Comments for documentation
COMMENT ON TABLE job_openings IS 'Job openings posted by individuals or admins';
COMMENT ON TABLE referral_requests_from_openings IS 'Referral requests made by job seekers for specific job openings';
COMMENT ON COLUMN job_openings.posted_by_type IS 'Type of poster: individual (only they get notified) or admin (all company employees notified)';
COMMENT ON COLUMN referral_requests_from_openings.notified_users IS 'JSON array of user IDs who were notified about this request';
