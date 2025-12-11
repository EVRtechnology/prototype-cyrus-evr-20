-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  suggestion_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  vote VARCHAR(10) NOT NULL,
  round INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_vote CHECK (vote IN ('for', 'against')),
  -- Ensure one vote per voter per suggestion
  UNIQUE(suggestion_id, voter_id)
);

-- Create indexes
CREATE INDEX idx_votes_session_id ON votes(session_id);
CREATE INDEX idx_votes_suggestion_id ON votes(suggestion_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_round ON votes(round);
CREATE INDEX idx_votes_timestamp ON votes(timestamp DESC);
