-- Add sample sites to organizations for testing
-- First, identify an organization to add sites to

-- Add sites for the first organization (adjust org_id as needed)
INSERT INTO org_sites (org_id, site_name, site_type, address_line1, city, state, pincode, area_sqft, floor_count, last_update_user, last_update_dt)
VALUES
-- Assuming org_id 1 exists, adjust as needed
(1, 'Tower A - Main Building', 'RESIDENTIAL_BUILDING', 'Koregaon Park Main Road', 'Pune', 'Maharashtra', '411001', 25000, 15, 1, NOW()),
(1, 'Manufacturing Unit 1', 'INDUSTRIAL_PLANT', 'MIDC Chakan Phase 2', 'Pune', 'Maharashtra', '410501', 50000, 3, 1, NOW()),
(1, 'Warehouse Complex', 'WAREHOUSE', 'Talegaon Industrial Area', 'Pune', 'Maharashtra', '410507', 35000, 2, 1, NOW()),
(1, 'Commercial Plaza', 'OFFICE_BUILDING', 'Baner Road', 'Pune', 'Maharashtra', '411045', 18000, 8, 1, NOW()),
(1, 'Blue Ridge Apartments', 'RESIDENTIAL_BUILDING', 'Hinjewadi Phase 1', 'Pune', 'Maharashtra', '411057', 45000, 22, 1, NOW());

-- Add sites for second organization if it exists
INSERT INTO org_sites (org_id, site_name, site_type, address_line1, city, state, pincode, area_sqft, floor_count, last_update_user, last_update_dt)
VALUES
(2, 'Sterling Towers - Block A', 'RESIDENTIAL_BUILDING', 'Kalyani Nagar', 'Pune', 'Maharashtra', '411006', 30000, 18, 1, NOW()),
(2, 'Corporate Office', 'OFFICE_BUILDING', 'Viman Nagar', 'Pune', 'Maharashtra', '411014', 12000, 6, 1, NOW()),
(2, 'Retail Hub', 'RETAIL_STORE', 'Koregaon Park', 'Pune', 'Maharashtra', '411001', 8000, 3, 1, NOW());

-- Verify the data
SELECT s.site_id, s.site_name, s.site_type, s.city, o.org_name 
FROM org_sites s
JOIN organizations o ON s.org_id = o.org_id
ORDER BY o.org_id, s.site_name;
