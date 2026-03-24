# Week 8 Prompt Chain Tool

This is a Next.js + Supabase starter for the Week 8 prompt chain assignment.

## Features
- Admin-only access based on `profiles.is_superadmin` or `profiles.is_matrix_admin`
- Create, update, delete humor flavors
- Create, update, delete humor flavor steps
- Reorder steps with up/down controls
- Test a flavor against an uploaded image file or image URL
- Save and read recent generated captions
- Light / dark / system theme toggle

## Pipeline API wiring
The test form now uses the official AlmostCrackd caption pipeline flow:
1. Generate presigned upload URL
2. Upload image bytes to the presigned URL
3. Register the CDN URL with the pipeline
4. Generate captions

The route is implemented in `app/api/run-flavor/route.ts`. It uses the signed-in user's Supabase JWT as the Bearer token for the pipeline API.

## Important note about humorFlavorId
The API supports generating captions for a specific remote humor flavor by passing `humorFlavorId`.
This starter stores that value in `humor_flavors.remote_humor_flavor_id`.

If you leave that field blank, the pipeline request still runs with only `imageId`.

## Setup
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase values
3. Run `schema.sql` in Supabase SQL Editor
4. Install deps with `npm install`
5. Start with `npm run dev`
