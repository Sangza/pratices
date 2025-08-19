-- Creator Growth Hub Database Schema
-- Designed for Supabase/PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (stores Farcaster user data)
CREATE TABLE users (
    fid BIGINT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    score_float DECIMAL(3,2), -- Neynar user quality score
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follower relationships
CREATE TABLE edges_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    follower_fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fid, follower_fid)
);

-- Indexes for performance
CREATE INDEX idx_edges_followers_fid ON edges_followers(fid);
CREATE INDEX idx_edges_followers_follower_fid ON edges_followers(follower_fid);
CREATE INDEX idx_edges_followers_created_at ON edges_followers(created_at);

-- Engagement tracking
CREATE TABLE engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    actor_fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('reply', 'like', 'recast', 'tip')),
    cast_hash VARCHAR(255),
    value_usd DECIMAL(10,2) DEFAULT 0, -- For tips
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for engagement
CREATE INDEX idx_engagement_fid ON engagement(fid);
CREATE INDEX idx_engagement_actor_fid ON engagement(actor_fid);
CREATE INDEX idx_engagement_type ON engagement(type);
CREATE INDEX idx_engagement_created_at ON engagement(created_at);

-- Collaboration recommendations cache
CREATE TABLE collab_recs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    target_fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    score_numeric DECIMAL(5,2) NOT NULL,
    reasons_json JSONB, -- Store reasons as JSON
    overlap_score DECIMAL(5,4),
    engagement_affinity DECIMAL(5,4),
    topic_similarity DECIMAL(5,4),
    audience_quality DECIMAL(5,4),
    momentum DECIMAL(5,4),
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fid, target_fid)
);

-- Indexes for collab recommendations
CREATE INDEX idx_collab_recs_fid ON collab_recs(fid);
CREATE INDEX idx_collab_recs_score ON collab_recs(score_numeric DESC);
CREATE INDEX idx_collab_recs_computed_at ON collab_recs(computed_at);

-- Leaderboard data
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    fan_fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    contributions_float DECIMAL(10,2) NOT NULL DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    recasts_count INTEGER DEFAULT 0,
    tips_count INTEGER DEFAULT 0,
    tips_value_usd DECIMAL(10,2) DEFAULT 0,
    window VARCHAR(10) NOT NULL CHECK (window IN ('7d', '30d', 'all')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fid, fan_fid, window)
);

-- Indexes for leaderboard
CREATE INDEX idx_leaderboard_fid ON leaderboard(fid);
CREATE INDEX idx_leaderboard_window ON leaderboard(window);
CREATE INDEX idx_leaderboard_contributions ON leaderboard(contributions_float DESC);

-- Hourly engagement vectors (for engagement affinity calculation)
CREATE TABLE hourly_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    hour INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
    engagement_count INTEGER DEFAULT 0,
    date DATE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fid, day_of_week, hour, date)
);

-- Indexes for hourly engagement
CREATE INDEX idx_hourly_engagement_fid ON hourly_engagement(fid);
CREATE INDEX idx_hourly_engagement_date ON hourly_engagement(date);

-- User channels/interests
CREATE TABLE user_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    channel VARCHAR(100) NOT NULL, -- e.g., "/tech", "/crypto"
    engagement_count INTEGER DEFAULT 0,
    last_engaged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fid, channel)
);

-- Indexes for user channels
CREATE INDEX idx_user_channels_fid ON user_channels(fid);
CREATE INDEX idx_user_channels_channel ON user_channels(channel);

-- Fan badges
CREATE TABLE fan_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    fan_fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    badge_type VARCHAR(20) NOT NULL CHECK (badge_type IN ('crown', 'gold', 'silver')),
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL for permanent badges
    UNIQUE(fid, fan_fid, badge_type)
);

-- Indexes for fan badges
CREATE INDEX idx_fan_badges_fid ON fan_badges(fid);
CREATE INDEX idx_fan_badges_fan_fid ON fan_badges(fan_fid);
CREATE INDEX idx_fan_badges_type ON fan_badges(badge_type);

-- Webhook events (for tracking Neynar webhooks)
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for webhook events
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);

-- Analytics cache (for performance)
CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
    cache_key VARCHAR(255) NOT NULL, -- e.g., "overlap_1234_5678", "leaderboard_30d"
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fid, cache_key)
);

-- Indexes for analytics cache
CREATE INDEX idx_analytics_cache_fid ON analytics_cache(fid);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collab_recs_updated_at BEFORE UPDATE ON collab_recs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate collab score
CREATE OR REPLACE FUNCTION calculate_collab_score(
    p_overlap DECIMAL,
    p_engagement_affinity DECIMAL,
    p_topic_similarity DECIMAL,
    p_audience_quality DECIMAL,
    p_momentum DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        0.35 * p_overlap +
        0.20 * p_engagement_affinity +
        0.20 * p_topic_similarity +
        0.15 * p_audience_quality +
        0.10 * p_momentum
    ) * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate fan score
CREATE OR REPLACE FUNCTION calculate_fan_score(
    p_replies INTEGER,
    p_recasts INTEGER,
    p_likes INTEGER,
    p_tips_count INTEGER,
    p_tips_value DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        5 * p_replies +
        2 * p_recasts +
        1 * p_likes +
        0.5 * p_tips_count +
        LN(1 + p_tips_value)
    );
END;
$$ LANGUAGE plpgsql;

-- Views for common queries

-- Top fans view
CREATE VIEW top_fans_view AS
SELECT 
    l.fid,
    l.fan_fid,
    u.username as fan_username,
    u.display_name as fan_display_name,
    u.avatar_url as fan_avatar,
    l.contributions_float,
    l.replies_count,
    l.likes_count,
    l.recasts_count,
    l.tips_count,
    l.tips_value_usd,
    l.window,
    ROW_NUMBER() OVER (PARTITION BY l.fid, l.window ORDER BY l.contributions_float DESC) as rank
FROM leaderboard l
JOIN users u ON l.fan_fid = u.fid
WHERE l.window = '30d';

-- User engagement summary view
CREATE VIEW user_engagement_summary AS
SELECT 
    fid,
    COUNT(*) as total_engagements,
    COUNT(*) FILTER (WHERE type = 'reply') as total_replies,
    COUNT(*) FILTER (WHERE type = 'like') as total_likes,
    COUNT(*) FILTER (WHERE type = 'recast') as total_recasts,
    COUNT(*) FILTER (WHERE type = 'tip') as total_tips,
    SUM(value_usd) as total_tips_value,
    MAX(created_at) as last_engagement
FROM engagement
GROUP BY fid;

-- Comments
COMMENT ON TABLE users IS 'Farcaster user profiles and metadata';
COMMENT ON TABLE edges_followers IS 'Follower relationships between users';
COMMENT ON TABLE engagement IS 'User engagement events (replies, likes, recasts, tips)';
COMMENT ON TABLE collab_recs IS 'Cached collaboration recommendations';
COMMENT ON TABLE leaderboard IS 'Fan leaderboard with weighted scoring';
COMMENT ON TABLE hourly_engagement IS 'Hourly engagement patterns for affinity calculation';
COMMENT ON TABLE user_channels IS 'User channel interests and engagement';
COMMENT ON TABLE fan_badges IS 'Fan achievement badges';
COMMENT ON TABLE webhook_events IS 'Neynar webhook event tracking';
COMMENT ON TABLE analytics_cache IS 'Cached analytics data for performance';
