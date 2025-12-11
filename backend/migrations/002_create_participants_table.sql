-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  billings_score DECIMAL(3, 2) NOT NULL DEFAULT 0.50, -- Range: 0.00 to 1.00
  role VARCHAR(50) NOT NULL,

  -- Current state
  has_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  votes_completed INTEGER NOT NULL DEFAULT 0,
  qr_code TEXT,
  qr_expires_at TIMESTAMP WITH TIME ZONE,

  -- History (stored as JSONB array)
  score_history JSONB NOT NULL DEFAULT '[]'::jsonb,

  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  CONSTRAINT valid_role CHECK (role IN ('submitter', 'voter')),
  CONSTRAINT valid_billings_score CHECK (billings_score >= 0.00 AND billings_score <= 1.00)
);

-- Create indexes
CREATE INDEX idx_participants_session_id ON participants(session_id);
CREATE INDEX idx_participants_role ON participants(role);
CREATE INDEX idx_participants_is_active ON participants(is_active);
CREATE INDEX idx_participants_billings_score ON participants(billings_score DESC);
CREATE INDEX idx_participants_joined_at ON participants(joined_at DESC);
