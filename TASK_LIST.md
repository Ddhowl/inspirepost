# InspirePost - Implementation Task List

## Project Overview
Automated system for generating and publishing inspirational quote images to Instagram.

**Website:** davetest.drewhowlett.com
**Posting Schedule:** 3x/week (Tue/Wed/Thu, 9 AM - 12 PM local time)
**Content Mix:** 60% curated quotes, 40% AI-generated
**Image Generation:** Gemini 3 Pro Preview (Nano Banana Pro)

---

## Phase 0: Proof of Concept (POC) ✅ COMPLETE
**Goal:** Validate core generation pipeline on davetest.drewhowlett.com

### Setup & Configuration
- [x] Set up Google AI Studio account and generate Gemini API key
- [x] Create new Next.js project in GitHub repo
- [x] Configure Vercel deployment for davetest.drewhowlett.com

### Quote Service
- [x] Build quote fetching service
- [x] Integrate ZenQuotes API (with attribution)
- [x] Integrate Quotable API (quotable.io)

### Image Generation
- [x] Build Gemini 3 Pro integration for image generation with embedded text
- [x] Configure image output: JPEG format, 1080x1350px (4:5 portrait)
- [x] Text is rendered directly by Gemini 3 Pro (no separate overlay needed)

### POC Website
- [x] Create simple webpage displaying generated quote image
- [x] Add 'Generate New' button for testing iterations
- [x] Add "Show Prompt" button to view the prompt sent to Gemini
- [ ] Test and refine image generation prompts for consistent quality

### POC Success Criteria
- [x] Can generate quote + image on demand via website
- [x] Images are consistently nature-themed with readable text
- [x] Output format is JPEG at correct dimensions (1080x1350)

---

## Phase 1: MVP - Content Queue & Preview
**Goal:** Build 7-day content queue with approval workflow

### Database Setup
- [ ] Set up database (Vercel KV or Supabase)
- [ ] Implement Content Item data model:
  ```
  {
    id, quote, author, source ('curated'|'ai_generated'),
    imageUrl, imageBase64, scheduledDate, scheduledTime,
    status ('pending'|'approved'|'rejected'|'published'|'failed'),
    instagramPostId, createdAt, approvedAt, publishedAt, errorMessage
  }
  ```

### Content Generation Service
- [ ] Build content generation service (auto-generates candidates)
- [ ] Integrate AI-generated quotes (Claude API)
  - Themes: mindfulness, gratitude, resilience, growth mindset, inner peace
  - Style: Concise (under 150 characters), original, non-attributed
- [ ] Implement hybrid content mix (60% curated, 40% AI)
- [ ] Add API Ninjas as backup quote source (optional)

### Preview Website UI
- [ ] Create 7-day calendar preview UI on website
- [ ] Implement approval/rejection buttons for each item
- [ ] Add 'regenerate' option for rejected content
- [ ] Show scheduled date/time for each content item

### Queue Management
- [ ] Build queue management logic (auto-fill to 7 days)
- [ ] Set up local scheduler (node-cron) for queue management
- [ ] Auto-replenish queue when items are approved/rejected

### Phase 1 Success Criteria
- [ ] Website shows next 7 days of content
- [ ] User can approve/reject content items
- [ ] System auto-replenishes queue with new candidates

---

## Phase 2: MVP - Instagram Integration
**Goal:** Enable automated posting to Instagram

### Instagram Account Setup
- [ ] Convert Instagram account to Creator/Business account
- [ ] Select appropriate category (Digital Creator, Personal Blog, etc.)
- [ ] Complete profile setup

### Meta Developer App Setup
- [ ] Create Meta Developer App at developers.facebook.com
- [ ] Select 'Business' as app type
- [ ] Add Instagram API product to app
- [ ] Configure OAuth redirect URIs (https://davetest.drewhowlett.com/api/auth/callback)
- [ ] Request required permissions:
  - instagram_business_basic
  - instagram_business_content_publish
- [ ] Complete App Review process for production access

### Instagram API Integration
- [ ] Implement Instagram OAuth flow
- [ ] Store Instagram access tokens securely (encrypted in database)
- [ ] Build Instagram Content Publishing integration:
  - Step 1: Create media container (POST /{ig-user-id}/media)
  - Step 2: Wait for processing (~10 seconds)
  - Step 3: Publish container (POST /{ig-user-id}/media_publish)
- [ ] Handle rate limits (25 posts per 24 hours)

### Content & Posting
- [ ] Add caption generation with hashtags
- [ ] Build local scheduler for posting (node-cron)
- [ ] Configure optimal posting times (Tue/Wed/Thu 9 AM - 12 PM)

### Error Handling & Notifications
- [ ] Implement error handling and retry logic
- [ ] Set up email notifications for failures (SendGrid/Resend)
- [ ] Test end-to-end posting workflow

### Phase 2 Success Criteria
- [ ] System can post to Instagram via API
- [ ] Approved content posts at scheduled times
- [ ] User receives alerts on any failures

---

## Phase 3: Production - Managed Scheduling
**Goal:** Move from local scheduler to cloud-managed scheduling

### Scheduler Migration
- [ ] Migrate scheduler to GitHub Actions workflows
- [ ] OR Configure Vercel Cron Jobs
- [ ] Set up scheduled triggers:
  - Content generation: daily
  - Posting: 3x/week (Tue/Wed/Thu)

### Token & Auth Management
- [ ] Implement token refresh automation (Instagram tokens expire after 60 days)
- [ ] Set up token expiry monitoring and alerts

### Monitoring & Operations
- [ ] Add monitoring dashboard for job status
- [ ] Set up comprehensive logging
- [ ] Configure backup notification channels
- [ ] Performance optimization and cleanup
- [ ] Documentation and runbook creation

### Phase 3 Success Criteria
- [ ] System runs fully automated without local processes
- [ ] Reliable posting 3x/week at scheduled times
- [ ] Queue always maintains 7 days of content

---

## Branding Guidelines (from PRD)
- **Fonts**: Playfair Display (quotes), Montserrat (attribution) - handled by Gemini 3 Pro
- **Color Palette**: Earthy tones - forest greens, sky blues, warm sunset oranges, soft neutrals
- **Text Placement**: Centered with semi-transparent overlay for readability
- **Watermark**: Subtle account handle in corner (optional, future feature)

---

## Environment Variables Required

```
# Google AI / Gemini 3 Pro
GEMINI_API_KEY=

# Instagram Platform API
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=https://davetest.drewhowlett.com/api/auth/callback

# Quote APIs
API_NINJAS_KEY= (optional)

# AI Quote Generation
ANTHROPIC_API_KEY= (for Claude API)

# Database
KV_URL= (Vercel KV)
# OR
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Notifications
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
ALERT_EMAIL=
```

---

## Estimated Monthly Costs
| Service | Cost |
|---------|------|
| Gemini 3 Pro (12 images/month @ ~$0.04) | $0.50 |
| Vercel Hobby (free tier) | $0.00 |
| Vercel KV (free tier) | $0.00 |
| Quote APIs (free tiers) | $0.00 |
| Claude API (optional, ~$0.01/quote) | $0.15 |
| Email notifications (free tier) | $0.00 |
| **Total** | **< $1.00/month** |

---

## Progress Log
| Date | Milestone | Notes |
|------|-----------|-------|
| 2025-12-17 | Phase 0 Complete | Switched to Gemini 3 Pro for text-in-image generation |
| | | POC website live with generate button and prompt viewer |
