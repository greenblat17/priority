-- Create table for storing duplicate detection results
CREATE TABLE duplicate_detections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duplicates JSONB NOT NULL DEFAULT '[]',
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'grouped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_duplicate_detections_task_id ON duplicate_detections(task_id);
CREATE INDEX idx_duplicate_detections_user_id ON duplicate_detections(user_id);
CREATE INDEX idx_duplicate_detections_status ON duplicate_detections(status);
CREATE INDEX idx_duplicate_detections_detected_at ON duplicate_detections(detected_at);

-- Enable RLS
ALTER TABLE duplicate_detections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own duplicate detections" ON duplicate_detections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own duplicate detections" ON duplicate_detections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert duplicate detections" ON duplicate_detections
  FOR INSERT WITH CHECK (true);

-- Add trigger to update updated_at
CREATE TRIGGER update_duplicate_detections_updated_at
  BEFORE UPDATE ON duplicate_detections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();