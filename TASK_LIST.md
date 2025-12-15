# InspirePost - Implementation Task List

## Project Overview
Automated system for generating and publishing inspirational quote images to Instagram.

**Website:** davetest.drewhowlett.com
**Posting Schedule:** 3x/week (Tue/Wed/Thu, 9-11 AM)
**Content Mix:** 60% curated quotes, 40% AI-generated

---

## Phase 0: Proof of Concept (POC)
**Goal:** Validate core generation pipeline on davetest.drewhowlett.com

### Setup & Configuration
- [ ] Set up Google AI Studio account and generate Imagen 3 API key
- [ ] Create new Next.js project in GitHub repo
- [ ] Configure Vercel deployment for davetest.drewhowlett.com

### Quote Service
- [ ] Build quote fetching service
- [ ] Integrate ZenQuotes API
- [ ] Integrate Quotable API (quotable.io)

### Image Generation
- [ ] Build Imagen 3 integration for background generation
- [ ] Implement text overlay system using Sharp or Canvas
- [ ] Configure image output: JPEG format, 1080x1350px (4:5 portrait)

### POC Website
- [ ] Create simple webpage displaying generated quote image
- [ ] Add 'Generate New' button for testing iterations
- [ ] Test and refine image generation prompts for consistent quality

### POC Success Criteria
- [ ] Can generate quote + image on demand via website
- [ ] Images are consistently nature-themed with readable text
- [ ] Output format is JPEG at correct dimensions (1080x1350)

---

## Phase 1: MVP - Content Queue & Preview
**Goal:** Build 7-day content queue with approval workflow

### Database Setup
- [ ] Set up database (Vercel KV or Supabase)
- [ ] Implement Content Item data model

### Content Generation Service
- [ ] Build content generation service (auto-generates candidates)
- [ ] Integrate AI-generated quotes (Claude API or similar)
- [ ] Implement hybrid content mix (60% curated, 40% AI)

### Preview Website UI
- [ ] Create 7-day calendar preview UI on website
- [ ] Implement approval/rejection buttons for each item
- [ ] Add 'regenerate' option for rejected content

### Queue Management
- [ ] Build queue management logic (auto-fill to 7 days)
- [ ] Set up local scheduler (node-cron) for queue management

### Phase 1 Success Criteria
- [ ] Website shows next 7 days of content
- [ ] User can approve/reject content items
- [ ] System auto-replenishes queue with new candidates

---

## Phase 2: MVP - Instagram Integration
**Goal:** Enable automated posting to Instagram

### Instagram Account Setup
- [ ] Convert Instagram account to Creator/Business
- [ ] Create Meta Developer App
- [ ] Configure OAuth redirect URIs
- [ ] Request required permissions (instagram_business_basic, instagram_business_content_publish)

### Instagram API Integration
- [ ] Implement Instagram OAuth flow
- [ ] Store Instagram access tokens securely
- [ ] Build Instagram Content Publishing integration
- [ ] Implement media container creation flow

### Content & Posting
- [ ] Add caption generation with hashtags
- [ ] Build local scheduler for posting (node-cron)
- [ ] Configure optimal posting times (Tue/Wed/Thu 9-11 AM)

### Error Handling & Notifications
- [ ] Implement error handling and retry logic
- [ ] Set up email notifications for failures
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
- [ ] Set up scheduled triggers: content generation (daily), posting (3x/week)

### Token & Auth Management
- [ ] Implement token refresh automation (Instagram tokens expire)

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

## Environment Variables Required

```
# Google AI / Imagen 3
GEMINI_API_KEY=

# Instagram Platform API
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=https://davetest.drewhowlett.com/api/auth/callback

# Quote APIs (optional)
API_NINJAS_KEY=

# Database
KV_URL=

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
| Imagen 3 (12 images/month @ $0.03) | $0.36 |
| Vercel Hobby (free tier) | $0.00 |
| Vercel KV (free tier) | $0.00 |
| Quote APIs (free tiers) | $0.00 |
| Email notifications (free tier) | $0.00 |
| **Total** | **< $1.00/month** |

---

## Progress Log
| Date | Milestone | Notes |
|------|-----------|-------|
| <!-- Add progress entries here --> | | |
