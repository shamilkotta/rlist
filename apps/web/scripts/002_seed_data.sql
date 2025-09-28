-- Insert some sample groups
INSERT INTO groups (name, description) VALUES 
  ('Tech Articles', 'Technology and programming related articles'),
  ('Design Inspiration', 'UI/UX design and creative inspiration'),
  ('Personal Development', 'Self-improvement and productivity articles')
ON CONFLICT DO NOTHING;

-- Insert some sample tags
INSERT INTO tags (name) VALUES 
  ('javascript'),
  ('react'),
  ('design'),
  ('productivity'),
  ('tutorial'),
  ('inspiration')
ON CONFLICT (name) DO NOTHING;
