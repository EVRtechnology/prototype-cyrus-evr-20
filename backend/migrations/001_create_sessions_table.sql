-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(9) UNIQUE NOT NULL, -- Format: ABCD-1234
  name VARCHAR(255) NOT NULL,
  facilitator_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'setup',

  -- Configuration (stored as JSONB for flexibility)
  config JSONB NOT NULL DEFAULT '{
    "maxParticipants": 500,
    "totalRounds": 3,
    "anonymousMode": false,
    "retryConfig": {
      "frequency": "every",
      "supportCollectionTime": 30
    },
    "displayOptions": {
      "liveDashboard": true,
      "retryQueue": true,
      "finalResults": true
    }
  }'::jsonb,

  current_round INTEGER NOT NULL DEFAULT 1,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_status CHECK (
    status IN ('setup', 'lobby', 'submission', 'voting', 'results', 'retry', 'ended')
  )
);

-- Create indexes
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_sessions_facilitator_id ON sessions(facilitator_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
