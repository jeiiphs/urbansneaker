/*
  # Create sneakers table with enhanced fields

  1. New Tables
    - `sneakers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `brand` (text)
      - `price` (decimal)
      - `description` (text)
      - `image_url` (text)
      - `sizes` (jsonb) - Array of available sizes
      - `style` (text)
      - `stock` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `sneakers` table
    - Add policy for public read access
    - Add policy for admin-only write access
*/

CREATE TABLE IF NOT EXISTS sneakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  price decimal(10,2) NOT NULL,
  description text,
  image_url text,
  sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  style text,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sneakers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
  ON sneakers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access"
  ON sneakers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_sneakers_updated_at
  BEFORE UPDATE ON sneakers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();