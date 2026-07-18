/**
 * scripts/migrate-faqs.ts
 *
 * One-time migration: pushes all FresherATS FAQ content into Sanity as
 * individual `faq` documents. Safe to re-run — checks for an existing
 * document with the same `question` before creating, so it will not
 * create duplicates if run more than once.
 *
 * Requires the `faq` schema (Phase 1) to already be deployed to Studio.
 *
 * Usage:
 *   SANITY_API_TOKEN=xxxxx npx tsx scripts/migrate-faqs.ts
 *
 * The token needs "Editor" (or higher) permissions on project byw5korl / production.
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const token = process.env.SANITY_API_TOKEN
if (!token) {
  console.error('Missing SANITY_API_TOKEN in environment. Aborting.')
  process.exit(1)
}

const client = createClient({
  projectId: 'byw5korl',
  dataset: 'production',
  apiVersion: '2026-01-01',
  token,
  useCdn: false, // must be false for writes
})

type FaqSeed = {
  question: string
  answer: string
  category:
    | 'getting-started'
    | 'analysis'
    | 'features'
    | 'privacy'
    | 'pricing'
  order: number
  showOnHomepage?: boolean
  relatedPage?: string
  status: 'draft' | 'published'
}

const faqs: FaqSeed[] = [
  // ---------- Getting Started ----------
  {
    question: 'What is an ATS resume checker?',
    answer:
      "An ATS resume checker analyzes your resume the way Applicant Tracking Systems do — scanning for keyword matches, formatting issues, and section structure — before a recruiter ever opens it. FresherATS gives you that score instantly, plus specific fixes to improve it.",
    category: 'getting-started',
    order: 1,
    showOnHomepage: true,
    status: 'published',
  },
  {
    question: 'How do I check my resume for ATS compatibility?',
    answer:
      "Upload your resume (PDF or DOCX), optionally paste the job description, and get your ATS score in about 10 seconds. You'll see a plain-language summary, section-level feedback, and — if you added a job description — the exact keywords you're missing.",
    category: 'getting-started',
    order: 2,
    status: 'published',
  },
  {
    question: 'What file formats does FresherATS accept?',
    answer:
      "We accept PDF and DOCX files up to 5MB. PDF is recommended since it's what most employers expect and preserves formatting best. We don't support image files (JPG, PNG) since those can't be parsed for ATS analysis.",
    category: 'getting-started',
    order: 3,
    status: 'published',
  },
  {
    question: 'I have no work experience yet — will this still help me?',
    answer:
      "Yes — FresherATS is built specifically for students and early-career job seekers. Our AI reads internships, university projects, coursework, and campus roles the way an ATS actually parses them, instead of scoring you against a template built for a 10-year career.",
    category: 'getting-started',
    order: 4,
    showOnHomepage: true,
    status: 'published',
  },
  {
    question: 'Does this work for non-tech roles like marketing, finance, or HR?',
    answer:
      "Yes. ATS systems are used across every industry, not just tech. As long as you paste the job description, our keyword analysis adapts to any field — we've helped freshers land roles in marketing, banking, accounting, and supply chain.",
    category: 'getting-started',
    order: 5,
    status: 'published',
  },

  // ---------- The Analysis ----------
  {
    question: 'How does the ATS score work?',
    answer:
      "Your score is calculated by comparing your resume's structure and content against the job description you provide — checking formatting, headings, and how many required keywords and skills genuinely appear in your experience.",
    category: 'analysis',
    order: 1,
    status: 'published',
  },
  {
    question: 'My score is low — does that mean my resume is bad?',
    answer:
      "Not necessarily. A low score usually means your resume isn't optimized for ATS parsers yet — tables, columns, graphics, or missing keywords are common causes. It doesn't mean your experience is weak, just that the format needs work. Most users go from a low score to 80+ within 15 minutes of edits.",
    category: 'analysis',
    order: 2,
    showOnHomepage: true,
    status: 'published',
  },
  {
    question: 'Should I stuff my resume with keywords to boost my score?',
    answer:
      "No. Keyword stuffing looks unnatural to the recruiter who reads your resume after it clears the ATS. Our suggestions only surface keywords that genuinely reflect your real skills and experience.",
    category: 'analysis',
    order: 3,
    status: 'published',
  },

  // ---------- Features ----------
  {
    question: 'What does the LinkedIn Checker do?',
    answer:
      "It scores your LinkedIn profile the same way we score your resume — headline, About section, experience bullets, and keyword gaps against your target role. You'll also see a combined Resume + LinkedIn score so you know if both are aligned.",
    category: 'features',
    order: 1,
    relatedPage: 'linkedin-checker',
    status: 'published',
  },
  {
    question: 'Does the Job Tracker cost anything?',
    answer:
      "The Job Tracker is free for up to 10 applications. You can save jobs, move them through stages (Saved → Applied → Interview → Offer), and get reminders before interviews. Pro removes the 10-application limit.",
    category: 'features',
    order: 2,
    relatedPage: 'job-tracker',
    status: 'published',
  },
  {
    question:
      'How is the AI Cover Letter Generator different from just using ChatGPT?',
    answer:
      "It reads your actual resume and the specific job description together, then writes a letter matching your real experience to that role's requirements — including keywords the ATS will scan for. It's specific to you and that job, not a generic template.",
    category: 'features',
    order: 3,
    relatedPage: 'ai-cover-letter-generator',
    status: 'published',
  },
  {
    question: 'Can I download my optimized resume?',
    answer:
      "Yes — once you've edited your resume in our editor, you can download it as a clean, ATS-friendly PDF.",
    category: 'features',
    order: 4,
    status: 'published',
  },

  // ---------- Privacy & Data ----------
  {
    question: 'Is my resume kept private?',
    answer:
      "Yes. Your resume is stored securely and only visible to you — we never share it with employers, recruiters, or third parties, and we don't sell or use it for advertising.",
    category: 'privacy',
    order: 1,
    showOnHomepage: true,
    status: 'published',
  },
  {
    question: 'Does FresherATS use my resume to train AI models?',
    answer:
      "No. Your resume text is sent to an AI API for analysis only — that request is processed and discarded. It's never used to train any AI model, ours or anyone else's.",
    category: 'privacy',
    order: 2,
    showOnHomepage: true,
    status: 'published',
  },
  {
    question: 'Can I delete my resume or account data?',
    answer:
      "Yes. Delete individual resumes anytime from your dashboard, or go to Settings → Delete Account to remove everything permanently within 24 hours.",
    category: 'privacy',
    order: 3,
    status: 'published',
  },

  // ---------- Pricing ----------
  {
    question: 'What plans does FresherATS offer, and which should I pick?',
    answer:
      "Four options: Free (unlimited ATS scans, no card needed), Single Resume Pack ($4.99 one-time — one full optimization with AI rewrites), Job Search Pass ($29.99 one-time, valid 3 months — best if you're actively applying), and Pro Monthly ($14.99/mo — best for ongoing access and monthly cover letters). If you're job hunting hard for a season, the Job Search Pass usually costs less than Pro Monthly over the same period.",
    category: 'pricing',
    order: 1,
    showOnHomepage: true,
    status: 'published',
  },
  {
    question: 'What happens when my Job Search Pass expires?',
    answer:
      "After 90 days, your account automatically drops to the Free plan. Nothing is deleted — you just lose access to AI rewrites, unlimited templates, and cover letters until you renew or upgrade.",
    category: 'pricing',
    order: 2,
    status: 'published',
  },
  {
    question: 'Is there a student discount?',
    answer:
      "Yes — students get Pro Monthly for $8.99/mo or the Job Search Pass for $19.99, verified with your university email, using code STUDENT40 at checkout.",
    category: 'pricing',
    order: 3,
    showOnHomepage: true,
    status: 'published',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      "Pro Monthly can be canceled anytime from your dashboard — no fees, and you keep access until the end of your billing period. The Job Search Pass and Single Resume Pack are one-time purchases with nothing to cancel. Your resumes and data stay intact either way.",
    category: 'pricing',
    order: 4,
    showOnHomepage: true,
    status: 'published',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      '[PLACEHOLDER — replace with actual refund policy before publishing. Do not flip status to "published" until this is real copy.]',
    category: 'pricing',
    order: 5,
    status: 'draft',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      '[PLACEHOLDER — confirm Lemon Squeezy\'s current card/region support, especially Pakistan, before publishing. Do not flip status to "published" until confirmed.]',
    category: 'pricing',
    order: 6,
    status: 'draft',
  },
]

async function migrate() {
  console.log(`Starting migration of ${faqs.length} FAQ documents...\n`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const faq of faqs) {
    try {
      const existing = await client.fetch(
        `*[_type == "faq" && question == $question][0]{ _id }`,
        { question: faq.question }
      )

      if (existing?._id) {
        console.log(`SKIP (already exists): "${faq.question}"`)
        skipped++
        continue
      }

      const doc = await client.create({
        _type: 'faq',
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: faq.order,
        showOnHomepage: faq.showOnHomepage ?? false,
        ...(faq.relatedPage ? { relatedPage: faq.relatedPage } : {}),
        status: faq.status,
      })

      console.log(`CREATED [${doc._id}]: "${faq.question}"`)
      created++
    } catch (err) {
      console.error(`FAILED: "${faq.question}"`, err)
      failed++
    }
  }

  console.log('\n--- Migration summary ---')
  console.log(`Created: ${created}`)
  console.log(`Skipped (duplicates): ${skipped}`)
  console.log(`Failed: ${failed}`)
  console.log(`Total processed: ${faqs.length}`)

  const draftCount = faqs.filter((f) => f.status === 'draft').length
  const publishedCount = faqs.filter((f) => f.status === 'published').length
  console.log(
    `\nExpected end state: ${publishedCount} published, ${draftCount} draft (pending refund/payment copy).`
  )
}

migrate().catch((err) => {
  console.error('Migration script failed:', err)
  process.exit(1)
})
