-- Add trigger to enforce session capacity limit

CREATE OR REPLACE FUNCTION check_session_capacity()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
  max_capacity INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM participants
  WHERE session_id = NEW.session_id AND is_active = TRUE;

  SELECT (config->>'maxParticipants')::INTEGER INTO max_capacity
  FROM sessions
  WHERE id = NEW.session_id;

  IF active_count >= max_capacity THEN
    RAISE EXCEPTION 'Session is full (max capacity: %)', max_capacity;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_session_capacity
  BEFORE INSERT ON participants
  FOR EACH ROW
  EXECUTE FUNCTION check_session_capacity();
