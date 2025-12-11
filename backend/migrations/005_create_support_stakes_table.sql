-- Create support_stakes table
CREATE TABLE IF NOT EXISTS support_stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  suggestion_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
  supporter_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  supporter_score_at_stake DECIMAL(3, 2) NOT NULL,

  staked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  outcome VARCHAR(20),

  CONSTRAINT valid_outcome CHECK (outcome IS NULL OR outcome IN ('success', 'failure')),
  CONSTRAINT valid_score_at_stake CHECK (supporter_score_at_stake >= 0.00 AND supporter_score_at_stake <= 1.00),
  -- Ensure one stake per supporter per suggestion
  UNIQUE(suggestion_id, supporter_id)
);

-- Create indexes
CREATE INDEX idx_support_stakes_session_id ON support_stakes(session_id);
CREATE INDEX idx_support_stakes_suggestion_id ON support_stakes(suggestion_id);
CREATE INDEX idx_support_stakes_supporter_id ON support_stakes(supporter_id);
CREATE INDEX idx_support_stakes_resolved ON support_stakes(resolved);
CREATE INDEX idx_support_stakes_staked_at ON support_stakes(staked_at DESC);
