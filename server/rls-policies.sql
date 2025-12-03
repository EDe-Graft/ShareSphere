-- Row Level Security (RLS) Policies for ShareSphere
-- Enable RLS on all tables and create appropriate policies

-- =============================================
-- USERS TABLE POLICIES
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile and public profiles
CREATE POLICY users_select_policy ON users
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id', true)::integer
        OR email_verified = true
    );

-- Users can update their own profile
CREATE POLICY users_update_policy ON users
    FOR UPDATE USING (
        user_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can insert their own profile (during registration)
CREATE POLICY users_insert_policy ON users
    FOR INSERT WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::integer
        OR current_setting('app.current_user_id', true) IS NULL
    );

-- Users can delete their own profile
CREATE POLICY users_delete_policy ON users
    FOR DELETE USING (
        user_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- VERIFICATION_TOKENS TABLE POLICIES
-- =============================================
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only access their own verification tokens
CREATE POLICY verification_tokens_select_policy ON verification_tokens
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id', true)::integer
    );

CREATE POLICY verification_tokens_insert_policy ON verification_tokens
    FOR INSERT WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::integer
    );

CREATE POLICY verification_tokens_update_policy ON verification_tokens
    FOR UPDATE USING (
        user_id = current_setting('app.current_user_id', true)::integer
    );

CREATE POLICY verification_tokens_delete_policy ON verification_tokens
    FOR DELETE USING (
        user_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- USER_STATS TABLE POLICIES
-- =============================================
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own stats and public stats
CREATE POLICY user_stats_select_policy ON user_stats
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id', true)::integer
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = user_stats.user_id 
            AND users.email_verified = true
        )
    );

-- Users can update their own stats
CREATE POLICY user_stats_update_policy ON user_stats
    FOR UPDATE USING (
        user_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can insert their own stats
CREATE POLICY user_stats_insert_policy ON user_stats
    FOR INSERT WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- ITEMS TABLE POLICIES
-- =============================================
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Users can view all available items
CREATE POLICY items_select_policy ON items
    FOR SELECT USING (
        available = 'true'
        OR uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can insert their own items
CREATE POLICY items_insert_policy ON items
    FOR INSERT WITH CHECK (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can update their own items
CREATE POLICY items_update_policy ON items
    FOR UPDATE USING (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can delete their own items
CREATE POLICY items_delete_policy ON items
    FOR DELETE USING (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- BOOKS TABLE POLICIES
-- =============================================
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Users can view all available books
CREATE POLICY books_select_policy ON books
    FOR SELECT USING (
        available = 'true'
        OR uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can insert their own books
CREATE POLICY books_insert_policy ON books
    FOR INSERT WITH CHECK (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can update their own books
CREATE POLICY books_update_policy ON books
    FOR UPDATE USING (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can delete their own books
CREATE POLICY books_delete_policy ON books
    FOR DELETE USING (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- FURNITURE TABLE POLICIES
-- =============================================
ALTER TABLE furniture ENABLE ROW LEVEL SECURITY;

-- Users can view all available furniture
CREATE POLICY furniture_select_policy ON furniture
    FOR SELECT USING (
        available = 'true'
        OR uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can insert their own furniture
CREATE POLICY furniture_insert_policy ON furniture
    FOR INSERT WITH CHECK (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can update their own furniture
CREATE POLICY furniture_update_policy ON furniture
    FOR UPDATE USING (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can delete their own furniture
CREATE POLICY furniture_delete_policy ON furniture
    FOR DELETE USING (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- CLOTHING TABLE POLICIES
-- =============================================
ALTER TABLE clothing ENABLE ROW LEVEL SECURITY;

-- Users can view all available clothing
CREATE POLICY clothing_select_policy ON clothing
    FOR SELECT USING (
        available = 'true'
        OR uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can insert their own clothing
CREATE POLICY clothing_insert_policy ON clothing
    FOR INSERT WITH CHECK (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can update their own clothing
CREATE POLICY clothing_update_policy ON clothing
    FOR UPDATE USING (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can delete their own clothing
CREATE POLICY clothing_delete_policy ON clothing
    FOR DELETE USING (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- MISCELLANEOUS TABLE POLICIES
-- =============================================
ALTER TABLE miscellaneous ENABLE ROW LEVEL SECURITY;

-- Users can view all available miscellaneous items
CREATE POLICY miscellaneous_select_policy ON miscellaneous
    FOR SELECT USING (
        available = 'true'
        OR uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can insert their own miscellaneous items
CREATE POLICY miscellaneous_insert_policy ON miscellaneous
    FOR INSERT WITH CHECK (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can update their own miscellaneous items
CREATE POLICY miscellaneous_update_policy ON miscellaneous
    FOR UPDATE USING (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can delete their own miscellaneous items
CREATE POLICY miscellaneous_delete_policy ON miscellaneous
    FOR DELETE USING (
        uploader_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- IMAGES TABLE POLICIES
-- =============================================
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Users can view images for available items or their own items
CREATE POLICY images_select_policy ON images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM items 
            WHERE items.item_id = images.item_id 
            AND (items.available = 'true' OR items.uploader_id = current_setting('app.current_user_id', true)::integer)
        )
    );

-- Users can insert images for their own items
CREATE POLICY images_insert_policy ON images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM items 
            WHERE items.item_id = images.item_id 
            AND items.uploader_id = current_setting('app.current_user_id', true)::integer
        )
    );

-- Users can update images for their own items
CREATE POLICY images_update_policy ON images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM items 
            WHERE items.item_id = images.item_id 
            AND items.uploader_id = current_setting('app.current_user_id', true)::integer
        )
    );

-- Users can delete images for their own items
CREATE POLICY images_delete_policy ON images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM items 
            WHERE items.item_id = images.item_id 
            AND items.uploader_id = current_setting('app.current_user_id', true)::integer
        )
    );

-- =============================================
-- FAVORITES TABLE POLICIES
-- =============================================
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can only view their own favorites
CREATE POLICY favorites_select_policy ON favorites
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can insert their own favorites
CREATE POLICY favorites_insert_policy ON favorites
    FOR INSERT WITH CHECK (
        user_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can update their own favorites
CREATE POLICY favorites_update_policy ON favorites
    FOR UPDATE USING (
        user_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can delete their own favorites
CREATE POLICY favorites_delete_policy ON favorites
    FOR DELETE USING (
        user_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- REVIEWS TABLE POLICIES
-- =============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can view all reviews
CREATE POLICY reviews_select_policy ON reviews
    FOR SELECT USING (true);

-- Users can insert reviews they wrote
CREATE POLICY reviews_insert_policy ON reviews
    FOR INSERT WITH CHECK (
        reviewer_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can update their own reviews
CREATE POLICY reviews_update_policy ON reviews
    FOR UPDATE USING (
        reviewer_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can delete their own reviews
CREATE POLICY reviews_delete_policy ON reviews
    FOR DELETE USING (
        reviewer_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- REPORT_DETAILS TABLE POLICIES
-- =============================================
ALTER TABLE report_details ENABLE ROW LEVEL SECURITY;

-- Users can view reports they submitted
CREATE POLICY report_details_select_policy ON report_details
    FOR SELECT USING (
        reporter_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can insert reports
CREATE POLICY report_details_insert_policy ON report_details
    FOR INSERT WITH CHECK (
        reporter_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can update their own reports
CREATE POLICY report_details_update_policy ON report_details
    FOR UPDATE USING (
        reporter_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can delete their own reports
CREATE POLICY report_details_delete_policy ON report_details
    FOR DELETE USING (
        reporter_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- REPORT_TRACKING TABLE POLICIES
-- =============================================
ALTER TABLE report_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own report tracking
CREATE POLICY report_tracking_select_policy ON report_tracking
    FOR SELECT USING (
        reporter_user_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can insert their own report tracking
CREATE POLICY report_tracking_insert_policy ON report_tracking
    FOR INSERT WITH CHECK (
        reporter_user_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can update their own report tracking
CREATE POLICY report_tracking_update_policy ON report_tracking
    FOR UPDATE USING (
        reporter_user_id = current_setting('app.current_user_id', true)::integer
    );

-- Users can delete their own report tracking
CREATE POLICY report_tracking_delete_policy ON report_tracking
    FOR DELETE USING (
        reporter_user_id = current_setting('app.current_user_id', true)::integer
    );

-- =============================================
-- ADMIN POLICIES (for superuser access)
-- =============================================

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if current user has admin role or specific admin user_id
    -- You can customize this based on your admin identification logic
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE user_id = current_setting('app.current_user_id', true)::integer
        AND username = 'admin'  -- or any other admin identification
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can access all data (override RLS for admin users)
CREATE POLICY admin_override_policy ON users
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON items
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON books
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON furniture
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON clothing
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON miscellaneous
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON images
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON favorites
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON reviews
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON report_details
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON report_tracking
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON verification_tokens
    FOR ALL USING (is_admin());

CREATE POLICY admin_override_policy ON user_stats
    FOR ALL USING (is_admin());

-- =============================================
-- HELPER FUNCTIONS FOR APPLICATION
-- =============================================

-- Function to set current user context
CREATE OR REPLACE FUNCTION set_user_context(user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear user context
CREATE OR REPLACE FUNCTION clear_user_context()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', NULL, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user context
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::integer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 