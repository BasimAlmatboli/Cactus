# Quick Discounts - Database Migration Guide

## Overview
This migration adds database-backed Quick Apply Discounts to the Cactus System. Quick discounts can be managed from the Settings page and will appear in the Calculator page.

## Prerequisites
- Access to Supabase dashboard
- URL: https://rkicwozgiufccgztvghl.supabase.co

## Migration Steps

### 1. Run the SQL Migration

1. Open Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `database/migrations/create_quick_discounts_table.sql`
4. Copy the entire SQL content
5. Paste into Supabase SQL Editor
6. Click **Run** to execute the migration

### 2. Verify Table Creation

After running the migration, verify the table was created:

```sql
-- Check if table exists
SELECT * FROM quick_discounts;

-- Should return 5 seeded discounts:
-- - 10% Off
-- - 15% Off
-- - 20% Off
-- - 39.5 SAR Off
-- - 79 SAR Off
```

### 3. Verify TypeScript Types

The TypeScript types have been automatically updated. After migration, restart the dev server to clear any type errors:

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## What This Migration Does

1. **Creates Table**: `quick_discounts` with the following columns:
   - `id` (UUID, primary key)
   - `name` (VARCHAR, display name)
   - `type` ('percentage' | 'fixed')
   - `value` (NUMERIC, discount amount)
   - `display_order` (INTEGER, for custom ordering)
   - `is_active` (BOOLEAN, to show/hide in Calculator)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **Adds Indexes**: For efficient queries on `display_order` and `is_active`

3. **Configures RLS**: Row Level Security policies for public read and authenticated write access

4. **Creates Trigger**: Auto-updates `updated_at` timestamp on row updates

5. **Seeds Data**: Migrates the 5 previously hardcoded discounts to the database

## Using the Feature

### In Settings Page
1. Navigate to **Settings → Quick Discounts**
2. You can:
   - Add new quick discounts
   - Edit existing discounts
   - Delete discounts (with confirmation)
   - Reorder discounts (using up/down arrows)
   - Toggle active/inactive status

### In Calculator Page
1. Navigate to **Calculator**
2. Scroll to the **Discount** section
3. Active quick discounts will appear as buttons under "Quick Apply"
4. Click any button to instantly apply that discount
5. Manual discount entry still works as before

## Troubleshooting

### TypeScript Errors in quickDiscountService.ts

If you see TypeScript errors about "never" types in `quickDiscountService.ts`, it means the table hasn't been created in Supabase yet. Run the migration first, then restart the dev server.

### No Quick Discounts Showing in Calculator

1. Check that the migration ran successfully
2. Verify at least one discount is marked as `is_active = true`
3. Check browser console for any API errors
4. Refresh the Calculator page

### RLS Permission Errors

If you get permission errors, verify that:
1. RLS is enabled on the table
2. All four policies are created (SELECT, INSERT, UPDATE, DELETE)
3. The policies use `USING (true)` to allow public access

## Rollback (if needed)

If you need to remove the quick discounts feature:

```sql
-- Drop the table and all related objects
DROP TABLE IF EXISTS quick_discounts CASCADE;
```

## Support

For issues or questions, check:
- Browser console for JavaScript errors
- Supabase logs for database errors
- Network tab for failed API calls
