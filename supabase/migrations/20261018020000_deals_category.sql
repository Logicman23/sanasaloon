-- Deals: any service whose category is exactly 'Deals' is listed on the website's Deals page
-- (and under a Deals tab in the POS) instead of the Services page.
-- Run in the Supabase SQL editor. To add a new deal later, insert a service with category 'Deals'.

update public.services
set category = 'Deals'
where name = 'Complete Grooming Deal';
