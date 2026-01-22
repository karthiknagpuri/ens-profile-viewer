-- ENS Profile Viewer - Supabase Database Setup
-- Run this SQL in your Supabase dashboard SQL Editor

-- Create ENS nodes table
CREATE TABLE IF NOT EXISTS ens_nodes (
  id BIGSERIAL PRIMARY KEY,
  ens_name VARCHAR(255) NOT NULL UNIQUE,
  eth_address VARCHAR(42),
  cached_profile JSONB,
  last_resolved TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create relationships table
CREATE TABLE IF NOT EXISTS relationships (
  id BIGSERIAL PRIMARY KEY,
  source_id BIGINT NOT NULL REFERENCES ens_nodes(id) ON DELETE CASCADE,
  target_id BIGINT NOT NULL REFERENCES ens_nodes(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'connection',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, target_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ens_nodes_name ON ens_nodes(ens_name);
CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_id);

-- Enable Row Level Security
ALTER TABLE ens_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access on ens_nodes" ON ens_nodes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ens_nodes" ON ens_nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ens_nodes" ON ens_nodes FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on relationships" ON relationships FOR SELECT USING (true);
CREATE POLICY "Allow public insert on relationships" ON relationships FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on relationships" ON relationships FOR DELETE USING (true);
