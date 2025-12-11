-- Create suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  content TEXT NOT NULL,

  -- Voting
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  required_votes INTEGER NOT NULL,

  -- Retry mechanism
  retry_count INTEGER NOT NULL DEFAULT 0,
  supporters JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of participant IDs
  needs_supporters INTEGER NOT NULL DEFAULT 3,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  voting_started_at TIMESTAMP WITH TIME ZONE,
  voting_ended_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'voting', 'passed', 'failed', 'retry_pending', 'retry_voting')
  ),
  CONSTRAINT valid_votes CHECK (votes_for >= 0 AND votes_against >= 0),
  CONSTRAINT valid_retry_count CHECK (retry_count >= 0)
);

-- Create indexes
CREATE INDEX idx_suggestions_session_id ON suggestions(session_id);
CREATE INDEX idx_suggestions_participant_id ON suggestions(participant_id);
CREATE INDEX idx_suggestions_round ON suggestions(round);
CREATE INDEX idx_suggestions_status ON suggestions(status);
CREATE INDEX idx_suggestions_created_at ON suggestions(created_at DESC);
CREATE INDEX idx_suggestions_session_round ON suggestions(session_id, round);
