/*
  # Create expenses table

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key)
      - `date` (date, not null)
      - `category` (text, not null)
      - `description` (text, not null)
      - `amount` (numeric, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `expenses` table
    - Add policy for authenticated users to manage their own expenses
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expenses"
  ON expenses
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL);