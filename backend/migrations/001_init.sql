-- Companies Table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(255),
    email VARCHAR(255),
    logo VARCHAR(255),
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'job_seeker',
    is_verified BOOLEAN DEFAULT FALSE,
    company_id INTEGER REFERENCES companies(id),
    resume TEXT,
    tech_stack TEXT,
    linkedin VARCHAR(255),
    github VARCHAR(255),
    reward_points BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Referral Requests Table
CREATE TABLE referral_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    company_id INTEGER NOT NULL REFERENCES companies(id),
    job_title VARCHAR(255) NOT NULL,
    job_url VARCHAR(255),
    description TEXT,
    tech_stack TEXT,
    experience_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'open',
    resume TEXT,
    referral_count INTEGER DEFAULT 0,
    max_referrals INTEGER DEFAULT 3,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Referrals Table
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES referral_requests(id),
    referrer_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    referrer_confirmed_at TIMESTAMP,
    job_seeker_confirmed_at TIMESTAMP,
    referral_proof TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Rewards Table
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    referral_id INTEGER REFERENCES referrals(id),
    type VARCHAR(50),
    points BIGINT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification Tokens Table
CREATE TABLE verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_requests_user_id ON referral_requests(user_id);
CREATE INDEX idx_requests_company_id ON referral_requests(company_id);
CREATE INDEX idx_requests_status ON referral_requests(status);
CREATE INDEX idx_referrals_request_id ON referrals(request_id);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_expires_at ON verification_tokens(expires_at);
