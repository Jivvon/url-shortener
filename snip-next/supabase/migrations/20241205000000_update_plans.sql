-- Update plan prices and rename business to max
UPDATE plans SET price_monthly = 1000 WHERE id = 'pro';
UPDATE plans SET
  id = 'max',
  name = 'Max',
  price_monthly = 3000,
  features = '["Unlimited URLs", "Custom domains", "Team members", "API access", "Unlimited history", "Dedicated support"]'::jsonb
WHERE id = 'business';

-- Update any profiles referencing old business plan
UPDATE profiles SET plan_id = 'max' WHERE plan_id = 'business';
