-- Create table for audience segment descriptions
CREATE TABLE IF NOT EXISTS audience_descriptions (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255),
    sub_category VARCHAR(255),
    topic VARCHAR(255) NOT NULL,
    topic_id VARCHAR(255),
    topic_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_audience_descriptions_topic ON audience_descriptions(topic);
CREATE INDEX IF NOT EXISTS idx_audience_descriptions_topic_id ON audience_descriptions(topic_id);
CREATE INDEX IF NOT EXISTS idx_audience_descriptions_category ON audience_descriptions(category);
CREATE INDEX IF NOT EXISTS idx_audience_descriptions_sub_category ON audience_descriptions(sub_category);

-- Add some sample data (you can replace this with your CSV data)
INSERT INTO audience_descriptions (category, sub_category, topic, topic_id, topic_description) VALUES
('Social Media', 'TikTok', 'TikTok Advertising', 'tiktok_ads', 'Audience segments interested in TikTok advertising and marketing campaigns'),
('Social Media', 'TikTok', 'TikTok Marketing', 'tiktok_marketing', 'Users engaged with TikTok marketing strategies and content creation'),
('Social Media', 'TikTok', 'TikTok For Business', 'tiktok_business', 'Business professionals using TikTok for brand promotion and customer engagement'),
('Employment', 'Remote Work', 'Work From Home Job Seekers', 'wfh_jobs', 'Individuals looking for remote work opportunities and online employment'),
('Marketing', 'Digital Marketing', 'Social Media Marketing', 'social_marketing', 'Professionals and businesses focused on social media marketing strategies'),
('Marketing', 'Digital Marketing', 'Digital Advertising', 'digital_ads', 'Audience interested in digital advertising platforms and campaigns'),
('Content', 'Creation', 'Content Creation', 'content_creation', 'Creators and professionals involved in digital content production'),
('E-commerce', 'Online Business', 'E-commerce', 'ecommerce', 'Online retailers and consumers engaged in e-commerce activities'),
('Marketing', 'Influencer', 'Influencer Marketing', 'influencer_marketing', 'Brands and influencers involved in influencer marketing campaigns');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_audience_descriptions_updated_at 
    BEFORE UPDATE ON audience_descriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 