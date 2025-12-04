-- Function to get daily clicks for a link
CREATE OR REPLACE FUNCTION get_daily_clicks(
  p_link_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  date DATE,
  clicks BIGINT,
  unique_visitors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    COUNT(*)::BIGINT as clicks,
    COUNT(DISTINCT ip_hash)::BIGINT as unique_visitors
  FROM clicks
  WHERE link_id = p_link_id
    AND created_at >= p_start_date
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at) ASC;
END;
$$ LANGUAGE plpgsql;
