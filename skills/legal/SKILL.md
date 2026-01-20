---
name: legal
description: |
  Generate Privacy Policy, Terms of Service, and Cookie Policy pages.
  Use when setting up legal pages for a new project, when asked to
  "create privacy policy", "add terms of service", "generate legal pages",
  or when /arc:letsgo identifies missing legal documents.
license: MIT
metadata:
  author: howells
---

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check for recent feature work that might affect data collection scope.
</progress_context>

# Legal Pages Workflow

Generate comprehensive legal pages (Privacy Policy, Terms of Service, Cookie Policy) through a guided, interactive process. Combines automatic project detection with user questions to create tailored documents.

**These are starting points that MUST be reviewed by a qualified lawyer before publishing.**

---

## Process Overview

```
Step 1: Disclaimer & Scope     → Set expectations
Step 2: Project Detection      → Scan codebase for data collection
Step 3: Guided Questions       → Interactive Q&A to fill gaps (5 rounds)
Step 4: Generate Documents     → Create tailored legal pages
Step 5: Implementation         → Add to project with proper routing
Step 6: Next Steps            → Cookie consent, lawyer review, etc.
```

---

## Step 1: Disclaimer & Scope

**Always start with this disclaimer:**

> ⚠️ **Important: These are template documents, not legal advice.**
>
> I'll generate comprehensive legal pages based on your project and answers, but:
> - I am not a lawyer and this is not legal advice
> - These templates should be reviewed by a qualified attorney
> - Laws vary by jurisdiction and change frequently
> - Regulated industries (healthcare, finance, children) have special requirements
>
> These documents will give you a solid starting point that covers common requirements under GDPR, CCPA, and general best practices.

**Ask: "Do you want to proceed with generating legal pages for this project?"**

---

## Step 2: Project Detection

Perform comprehensive codebase scan for data collection signals.

### Detection Checklist

```
Search for and report on:

AUTHENTICATION
├── next-auth / NextAuth.js    → OAuth providers, session strategy
├── clerk                       → User profiles, organizations
├── supabase auth              → Email, OAuth, phone auth
├── firebase auth              → Multiple auth methods
├── lucia                       → Session-based auth
├── auth0                       → Enterprise SSO, social login
├── passport.js                → Strategy-based auth
└── Custom auth                → JWT, session cookies

ANALYTICS & TRACKING
├── Google Analytics (gtag, GA4)
│   └── Cookies: _ga (2 years), _gid (24h), _gat (1 min)
├── Google Tag Manager         → Container for multiple tags
├── Plausible                  → Privacy-focused, no cookies
├── Fathom                     → Privacy-focused, no cookies
├── PostHog                    → Product analytics, session recording
├── Mixpanel                   → Event tracking, user profiles
├── Amplitude                  → Product analytics
├── Heap                       → Auto-capture analytics
├── Hotjar/FullStory          → Session recording, heatmaps
├── Vercel Analytics          → Privacy-focused, no cookies
└── Segment                    → Customer data platform

PAYMENTS & BILLING
├── Stripe
│   └── You store: customer_id, subscription status
│   └── Stripe stores: payment methods, card details
│   └── Cookies: __stripe_mid, __stripe_sid
├── Paddle                     → Merchant of record model
├── LemonSqueezy              → Merchant of record model
├── PayPal                     → Payment processor
└── Custom billing             → Invoice data, payment history

EMAIL SERVICES
├── Resend                     → Transactional email
├── SendGrid                   → Email delivery
├── Postmark                   → Transactional email
├── Mailchimp/ConvertKit      → Marketing email, subscriber lists
├── Customer.io               → Marketing automation
└── AWS SES                    → Email infrastructure

ERROR TRACKING & MONITORING
├── Sentry                     → Error tracking, may capture user context
├── LogRocket                  → Session replay, error tracking
├── Bugsnag                    → Error monitoring
├── Datadog                    → APM, logging, traces
└── New Relic                  → Application monitoring

CUSTOMER SUPPORT
├── Intercom                   → Chat, user data, conversation history
├── Crisp                      → Live chat
├── Zendesk                    → Support tickets
├── HelpScout                  → Customer support
└── Freshdesk                  → Support platform

DATABASE & STORAGE
├── PostgreSQL/MySQL          → User data storage
├── MongoDB                    → Document storage
├── Prisma                     → ORM (check schema for PII)
├── Drizzle                    → ORM
├── Supabase                   → Database + auth + storage
├── PlanetScale               → MySQL platform
├── Neon                       → Serverless Postgres
├── Cloudinary                → Image/video storage
├── Uploadthing               → File uploads
├── AWS S3                     → Object storage
└── Vercel Blob               → File storage

HOSTING & INFRASTRUCTURE
├── Vercel                     → Logs IP addresses, request data
├── Netlify                    → Similar logging
├── AWS                        → CloudFront logs, ALB logs
├── Cloudflare                → CDN, may set cookies
└── Railway/Render            → Platform logs

MARKETING & ADS
├── Facebook Pixel            → Conversion tracking
│   └── Cookies: _fbp, fr
├── Google Ads                → Conversion tracking
│   └── Cookies: _gcl_au, _gcl_aw
├── LinkedIn Insight Tag      → B2B tracking
├── Twitter/X Pixel           → Conversion tracking
├── TikTok Pixel              → Conversion tracking
└── Pinterest Tag             → Conversion tracking

CMS & CONTENT
├── Sanity                     → Content management
├── Contentful                → Headless CMS
├── Payload                    → Headless CMS
├── Strapi                     → Headless CMS
└── WordPress API             → Content source

FORMS & DATA COLLECTION
├── Contact forms              → Name, email, message
├── Newsletter signup         → Email address
├── User profiles             → Various PII
├── File uploads              → User-generated content
├── Surveys/feedback          → User responses
└── Job applications          → Resumes, personal info
```

### Detection Output Format

Present findings to user:

```markdown
## 📊 Data Collection Detection Results

### Authentication
**Detected:** NextAuth.js with Google and GitHub OAuth
- **Data collected:** Email, name, profile picture from OAuth providers
- **Data stored:** User record in database, session cookie
- **Session strategy:** JWT / Database sessions

### Analytics
**Detected:** Google Analytics 4
- **Data collected:** Page views, events, device info, IP address
- **Cookies set:**
  | Cookie | Purpose | Duration | Type |
  |--------|---------|----------|------|
  | _ga | Distinguishes users | 2 years | Analytics |
  | _gid | Distinguishes users | 24 hours | Analytics |

### Payments
**Detected:** Stripe
- **Data you store:** Customer ID, subscription status, billing address
- **Data Stripe stores:** Payment methods, transaction history
- **Note:** You are NOT a data controller for card numbers—Stripe is

### Third-Party Processors
| Service | Data Shared | Purpose | Their Privacy Policy |
|---------|-------------|---------|---------------------|
| Vercel | IP, request logs | Hosting | vercel.com/legal/privacy-policy |
| Resend | Email addresses | Transactional email | resend.com/legal/privacy-policy |
| Sentry | Error data, user context | Error tracking | sentry.io/privacy |

### Cookies Summary
| Category | Count | Examples |
|----------|-------|----------|
| Essential | 2 | Session, CSRF token |
| Analytics | 2 | _ga, _gid |
| Marketing | 0 | None detected |
| Functional | 1 | Theme preference |
```

---

## Step 3: Guided Questions

Use AskUserQuestion tool for each round. One focused topic at a time.

### Round 1: Business Identity

```
Question: "What are your business details?"
Header: "Business"
Options: [Free text response needed]

Gather:
- Legal business name (e.g., "Acme Inc." or "John Smith trading as Acme")
- Country/state of incorporation or residence
- Business type: Company, LLC, Sole proprietor, etc.
- Website URL
- Contact email for privacy/legal inquiries
- Physical address (required for some jurisdictions, recommended for all)
```

### Round 2: Target Audience & Jurisdiction

```
Question: "Where are your users located?"
Header: "Jurisdiction"
Options:
  - "Worldwide (GDPR + CCPA compliant)" [Recommended]
    → Covers EU, California, and general best practices
  - "US only"
    → CCPA for California, general US practices
  - "EU/EEA only"
    → GDPR-focused
  - "Specific countries"
    → Ask follow-up for which countries

Follow-up if needed:
Question: "Do you expect users under 18?"
Header: "Age"
Options:
  - "No, adults only (18+)"
  - "Yes, 13-17 with parental consent"
  - "Yes, under 13" → COPPA applies, special handling required
  - "Not sure"
```

### Round 3: Documents Needed

```
Question: "Which legal documents do you need?"
Header: "Documents"
MultiSelect: true
Options:
  - "Privacy Policy" [Required for almost all sites]
    → Required if you collect ANY data (even just analytics)
  - "Terms of Service"
    → Required for apps/SaaS, recommended for all
  - "Cookie Policy"
    → Required if using non-essential cookies (can be section in Privacy Policy)
  - "Acceptable Use Policy"
    → Recommended if users can post content or interact
```

### Round 4: Service Type & Features

```
Question: "What type of service is this?"
Header: "Service type"
Options:
  - "SaaS / Web application"
    → User accounts, possibly subscriptions
  - "E-commerce / Online store"
    → Products, checkout, shipping
  - "Content / Blog / Marketing site"
    → Minimal data collection
  - "Marketplace / Platform"
    → Multiple user types, transactions between users
  - "API / Developer tools"
    → API keys, usage data, developer accounts

Follow-up based on selection:
- SaaS: "Do you offer free trials? Refund policy? Subscription billing?"
- E-commerce: "Physical or digital products? Return policy? Shipping regions?"
- Marketplace: "Do you facilitate payments between users? Take commission?"
```

### Round 5: Specific Policies

```
Question: "What are your data practices?"
Header: "Practices"
MultiSelect: true
Options:
  - "We use data only for providing our service"
  - "We send marketing emails (with consent)"
  - "We share anonymized/aggregated data"
  - "We use AI/ML to process user data"
  - "We allow third-party integrations"

Question: "What is your refund/cancellation policy?"
Header: "Refunds"
Options:
  - "14-day money-back guarantee"
  - "30-day money-back guarantee"
  - "Pro-rated refunds for annual plans"
  - "No refunds (for digital goods)"
  - "Custom policy" → Ask for details
```

---

## Step 4: Generate Documents

Based on detection + user answers, generate **fully personalized documents**.

### CRITICAL: No Placeholders

**DO NOT** generate documents with `[PLACEHOLDER]` markers. The documents must be:
- Filled in with actual company name, URLs, emails from user answers
- Populated with actual detected services (Stripe, Vercel, etc.) by name
- Include real cookie names and durations from detection
- Have actual data categories based on what was detected
- Remove sections that don't apply (e.g., no Payments section if no payments detected)

**Example — WRONG:**
```
We share data with [SERVICE_PROVIDERS].
Contact us at [EMAIL].
```

**Example — CORRECT:**
```
We share data with Vercel (hosting), Stripe (payments), and Resend (email).
Contact us at privacy@acme.com.
```

The templates below show the **structure**. When generating, replace ALL bracketed items with real values from detection and user answers. If a section doesn't apply to this project, omit it entirely.

---

### Privacy Policy — Structure Reference

```markdown
# Privacy Policy

**Last updated:** [DATE]
**Effective date:** [DATE]

## Introduction

[COMPANY_NAME] ("**Company**," "**we**," "**us**," or "**our**") operates [WEBSITE_URL] and related services (collectively, the "**Service**").

This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Service. It also describes your rights regarding your personal data and how to exercise them.

By using our Service, you agree to the collection and use of information as described in this policy. If you do not agree, please do not use our Service.

---

## Information We Collect

### Information You Provide Directly

[BASED ON DETECTION - include relevant sections:]

**Account Information**
When you create an account, we collect:
- Email address
- Name
- Password (stored securely using [hashing method])
- Profile information you choose to provide

**Payment Information**
When you make a purchase, we collect:
- Billing name and address
- Payment method details are processed by [Stripe/payment provider] and we do not store full card numbers

**Communications**
When you contact us, we collect:
- Email address
- Name
- Message content
- Any attachments you send

**User Content**
[If UGC platform]
Content you post, upload, or share through our Service, including:
- Text, images, videos, or files you upload
- Comments and interactions
- Profile information you make public

### Information Collected Automatically

**Log Data**
Our servers automatically record:
- IP address
- Browser type and version
- Operating system
- Pages visited and time spent
- Referring URL
- Date and time of access

**Device Information**
- Device type (desktop, mobile, tablet)
- Screen resolution
- Language preference
- Time zone

**Cookies and Similar Technologies**
We use cookies and similar tracking technologies. See our [Cookie Policy](#cookie-policy) for details.

[INSERT COOKIE TABLE FROM DETECTION]

### Information from Third Parties

**OAuth Providers**
[If OAuth detected]
When you sign in using [Google/GitHub/etc.], we receive:
- Email address
- Name
- Profile picture
- Unique identifier from the provider

We only request the minimum permissions necessary. We do not access your [contacts/calendar/etc.] unless you explicitly grant permission.

**Payment Processors**
[If payments detected]
[Stripe/provider] may share:
- Transaction confirmations
- Billing address
- Payment status

**Analytics Providers**
[If analytics detected]
We receive aggregated and anonymized data about how users interact with our Service.

---

## How We Use Your Information

We use your information for the following purposes:

### To Provide Our Service
- Create and manage your account
- Process transactions and send related information
- Provide customer support
- Enable features and functionality

### To Improve Our Service
- Analyze usage patterns and trends
- Debug and fix issues
- Develop new features
- Conduct research and analysis

### To Communicate With You
- Send transactional emails (receipts, password resets, etc.)
- Send service announcements and updates
- [If marketing] Send promotional communications (with your consent)
- Respond to your inquiries

### To Protect Our Service
- Detect and prevent fraud, abuse, and security incidents
- Enforce our Terms of Service
- Comply with legal obligations

### Legal Basis for Processing (EEA/UK Users)

[IF GDPR APPLIES]
If you are in the European Economic Area or United Kingdom, we process your data under these legal bases:

| Purpose | Legal Basis |
|---------|-------------|
| Providing our Service | Performance of contract |
| Account management | Performance of contract |
| Payment processing | Performance of contract |
| Service communications | Performance of contract |
| Marketing communications | Consent (you can withdraw anytime) |
| Analytics and improvement | Legitimate interests |
| Security and fraud prevention | Legitimate interests |
| Legal compliance | Legal obligation |

---

## How We Share Your Information

We do **not** sell your personal information. We may share your information in these circumstances:

### Service Providers

We share data with third parties who help us operate our Service:

[INSERT TABLE FROM DETECTION]
| Provider | Purpose | Data Shared | Privacy Policy |
|----------|---------|-------------|----------------|
| Vercel | Hosting | IP address, request logs | [Link] |
| Stripe | Payments | Billing info, transaction data | [Link] |
| [etc.] | | | |

These providers are contractually obligated to:
- Use your data only for the services they provide to us
- Protect your data with appropriate security measures
- Delete or return your data when the relationship ends

### Legal Requirements

We may disclose your information if required to:
- Comply with a legal obligation, subpoena, or court order
- Protect our rights, property, or safety
- Protect the rights, property, or safety of our users or the public
- Detect, prevent, or address fraud, security, or technical issues

### Business Transfers

If we are involved in a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before your data becomes subject to a different privacy policy.

### With Your Consent

We may share your information for other purposes if you give us explicit consent.

---

## International Data Transfers

[IF GDPR APPLIES]
Your information may be transferred to and processed in countries outside the European Economic Area, including the United States.

When we transfer data outside the EEA, we ensure appropriate safeguards:
- **Adequacy decisions:** Some countries are deemed to provide adequate protection by the European Commission
- **Standard Contractual Clauses:** We use EU-approved SCCs with our service providers
- **Data Privacy Framework:** Some US providers are certified under the EU-US Data Privacy Framework

---

## Data Retention

We retain your information for as long as necessary to:
- Provide our Service to you
- Comply with legal obligations
- Resolve disputes
- Enforce our agreements

**Specific retention periods:**

| Data Type | Retention Period | Reason |
|-----------|-----------------|--------|
| Account data | Until account deletion + [X days] | Service provision |
| Transaction records | [7 years] | Tax/legal requirements |
| Server logs | [90 days] | Security and debugging |
| Analytics data | [26 months] | Service improvement |
| Marketing preferences | Until consent withdrawn | Compliance |

When data is no longer needed, we securely delete or anonymize it.

---

## Data Security

We implement appropriate technical and organizational measures to protect your information:

- Encryption in transit (TLS/HTTPS)
- Encryption at rest for sensitive data
- Access controls and authentication
- Regular security assessments
- Employee training on data protection

However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.

**If you discover a security vulnerability, please report it to [security email].**

---

## Your Rights and Choices

### All Users

- **Access:** Request a copy of your personal data
- **Correction:** Update or correct inaccurate data
- **Deletion:** Request deletion of your data
- **Opt-out of marketing:** Unsubscribe from promotional emails
- **Cookie preferences:** Manage cookie settings via our cookie banner

### EEA/UK Users (GDPR)

[IF GDPR APPLIES]
You have additional rights under GDPR:

- **Right to be forgotten:** Request erasure of your data
- **Right to restrict processing:** Limit how we use your data
- **Right to data portability:** Receive your data in a portable format
- **Right to object:** Object to processing based on legitimate interests
- **Right to withdraw consent:** Withdraw consent at any time
- **Right to lodge a complaint:** File a complaint with your local data protection authority

**To exercise these rights:** Email us at [privacy email] with "GDPR Request" in the subject line. We will respond within 30 days.

**Data Protection Authority:** You can lodge a complaint with your local supervisory authority. A list is available at [link to EU DPA list].

### California Residents (CCPA/CPRA)

[IF CCPA APPLIES]
Under the California Consumer Privacy Act and California Privacy Rights Act, you have the right to:

- **Know:** What personal information we collect, use, and share
- **Delete:** Request deletion of your personal information
- **Correct:** Request correction of inaccurate information
- **Opt-out:** Opt out of the sale or sharing of personal information
- **Non-discrimination:** Not receive discriminatory treatment for exercising your rights
- **Limit use of sensitive information:** Limit how we use sensitive personal information

**Categories of information collected in the past 12 months:**
[INSERT BASED ON DETECTION]

| Category | Collected | Source | Purpose | Shared With |
|----------|-----------|--------|---------|-------------|
| Identifiers (name, email) | Yes | You | Account | Service providers |
| Commercial info (purchases) | Yes | You | Transactions | Payment processor |
| Internet activity (logs) | Yes | Automatic | Security | Hosting provider |
| [etc.] | | | | |

**We do not sell personal information** as defined by CCPA.

**To exercise these rights:** Email [privacy email] with "CCPA Request" in the subject line, or use our online form at [link].

We will verify your identity before processing requests. You may designate an authorized agent to make requests on your behalf.

---

## Children's Privacy

Our Service is not intended for children under [13/16 based on jurisdiction].

We do not knowingly collect personal information from children under [age]. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at [email].

If we discover we have collected personal information from a child under [age], we will delete it promptly.

[IF COPPA APPLIES - add specific COPPA compliance section]

---

## Third-Party Links

Our Service may contain links to third-party websites or services. We are not responsible for their privacy practices. We encourage you to read their privacy policies before providing any information.

---

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of material changes by:
- Posting the new policy on this page
- Updating the "Last updated" date
- [If significant] Sending an email notification

We encourage you to review this policy periodically.

---

## Contact Us

If you have questions about this Privacy Policy or our data practices, contact us:

**[COMPANY_NAME]**
Email: [PRIVACY_EMAIL]
Address: [PHYSICAL_ADDRESS]

[IF GDPR APPLIES]
**Data Protection Officer:** [If applicable]
Email: [DPO email]

---

## Cookie Policy

[Can be separate page or section]

### What Are Cookies?

Cookies are small text files stored on your device when you visit websites. They help websites function properly, remember your preferences, and provide analytics.

### Types of Cookies We Use

#### Strictly Necessary Cookies
These cookies are essential for the website to function. You cannot opt out of these.

| Cookie Name | Purpose | Duration | Provider |
|-------------|---------|----------|----------|
[BASED ON DETECTION]
| __session | Maintains login state | Session | First-party |
| csrf_token | Security protection | Session | First-party |

#### Functional Cookies
These cookies enable enhanced functionality and personalization.

| Cookie Name | Purpose | Duration | Provider |
|-------------|---------|----------|----------|
[BASED ON DETECTION]
| theme | Remembers dark/light mode | 1 year | First-party |
| locale | Remembers language preference | 1 year | First-party |

#### Analytics Cookies
These cookies help us understand how visitors use our website.

| Cookie Name | Purpose | Duration | Provider |
|-------------|---------|----------|----------|
[BASED ON DETECTION - e.g.:]
| _ga | Distinguishes unique users | 2 years | Google Analytics |
| _gid | Distinguishes unique users | 24 hours | Google Analytics |
| _gat | Throttles request rate | 1 minute | Google Analytics |

#### Marketing Cookies
[If applicable]
These cookies track visitors across websites for advertising purposes.

| Cookie Name | Purpose | Duration | Provider |
|-------------|---------|----------|----------|
[BASED ON DETECTION]
| _fbp | Facebook ad targeting | 90 days | Meta |
| _gcl_au | Google Ads conversion | 90 days | Google |

### Managing Your Cookie Preferences

**Cookie Banner:** Use our cookie consent banner to accept or reject non-essential cookies.

**Browser Settings:** Most browsers allow you to:
- Block all cookies
- Block third-party cookies only
- Delete cookies when you close your browser
- Be notified when a cookie is set

**Opt-Out Links:**
- Google Analytics: [https://tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout)
- Facebook: [https://www.facebook.com/settings?tab=ads](https://www.facebook.com/settings?tab=ads)
- Google Ads: [https://adssettings.google.com](https://adssettings.google.com)
- All participating companies: [https://optout.aboutads.info](https://optout.aboutads.info)

**Note:** Disabling certain cookies may affect website functionality.

### Updates to Cookie Policy

We may update this Cookie Policy to reflect changes in our practices or for legal reasons. Check this page periodically for updates.
```

---

### Terms of Service — Structure Reference

```markdown
# Terms of Service

**Last updated:** [DATE]
**Effective date:** [DATE]

## Agreement to Terms

These Terms of Service ("**Terms**") constitute a legally binding agreement between you ("**you**" or "**User**") and [COMPANY_NAME] ("**Company**," "**we**," "**us**," or "**our**") governing your access to and use of [WEBSITE_URL] and related services (collectively, the "**Service**").

**By accessing or using our Service, you agree to be bound by these Terms.** If you do not agree to these Terms, you may not access or use the Service.

If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.

---

## Description of Service

[CUSTOMIZE BASED ON SERVICE TYPE]

[COMPANY_NAME] provides [brief description of what the service does].

[If SaaS]: We offer [describe main features] through our web application and related tools.

[If E-commerce]: We sell [describe products] through our online store.

[If Marketplace]: We provide a platform connecting [buyers/sellers/users] to [describe transactions].

---

## Eligibility

To use our Service, you must:
- Be at least [18/13+parental consent] years old
- Have the legal capacity to enter into a binding agreement
- Not be prohibited from using the Service under applicable laws
- [If B2B]: Be authorized to bind your organization

If you are under 18, you may only use the Service with parental or guardian consent and supervision.

---

## Account Registration

[IF AUTH DETECTED]

### Creating an Account

To access certain features, you must create an account. When registering, you agree to:
- Provide accurate, current, and complete information
- Maintain and update your information as needed
- Keep your password secure and confidential
- Not share your account credentials with others
- Notify us immediately of any unauthorized access

### Account Security

You are responsible for all activities that occur under your account. We are not liable for any loss or damage arising from unauthorized use of your account.

We may suspend or terminate accounts that:
- Violate these Terms
- Are used for fraudulent or illegal activities
- Remain inactive for [period] or more
- Are created using false information

---

## Subscriptions and Payments

[IF PAYMENTS DETECTED]

### Pricing and Billing

[CUSTOMIZE BASED ON PRICING MODEL]

- All prices are listed in [USD/currency] and do not include applicable taxes
- We may change prices with [30 days] notice
- Price changes do not affect current subscription periods

### Payment Processing

Payments are processed by [Stripe/payment provider]. By providing payment information, you authorize us to charge the applicable fees.

You agree to:
- Provide valid payment information
- Authorize recurring charges for subscriptions
- Pay all fees and applicable taxes

### Subscriptions

[If subscription-based]

- Subscriptions automatically renew at the end of each billing period
- You may cancel anytime from your account settings
- Cancellation takes effect at the end of the current billing period
- No partial refunds for unused portions of a billing period

### Refunds

[CUSTOMIZE - examples:]

**Option A: Money-back guarantee**
We offer a [14/30]-day money-back guarantee. If you're not satisfied, contact us within [period] of purchase for a full refund.

**Option B: Pro-rated refunds**
Annual subscriptions may receive pro-rated refunds for the unused portion, minus any discounts applied.

**Option C: No refunds**
Due to the nature of digital goods/services, all sales are final. No refunds are provided except as required by law.

### Failed Payments

If a payment fails, we may:
- Retry the charge [X] times over [Y] days
- Suspend access to paid features
- Downgrade your account to a free tier (if available)

---

## Acceptable Use

You agree to use the Service only for lawful purposes. You must NOT:

### Illegal Activities
- Violate any applicable laws or regulations
- Engage in fraud, money laundering, or illegal transactions
- Infringe intellectual property rights
- Violate privacy rights of others

### Harmful Conduct
- Harass, abuse, threaten, or intimidate others
- Post defamatory, obscene, or offensive content
- Impersonate others or misrepresent your identity
- Stalk or collect personal information about others

### Technical Abuse
- Attempt to gain unauthorized access to our systems
- Introduce malware, viruses, or harmful code
- Interfere with or disrupt the Service
- Circumvent security measures or access controls
- Scrape, crawl, or harvest data without permission
- Use automated systems (bots) except as permitted

### Commercial Misuse
- Resell or redistribute the Service without authorization
- Use the Service to send spam or unsolicited messages
- Compete with us using data obtained from the Service
- Sublicense or transfer your account

[ADD SERVICE-SPECIFIC RESTRICTIONS]

We reserve the right to investigate violations and take appropriate action, including suspending or terminating your account, reporting to law enforcement, and pursuing legal remedies.

---

## User Content

[IF UGC PLATFORM]

### Your Content

"**User Content**" means any content you submit, post, or transmit through the Service, including text, images, videos, comments, and files.

You retain ownership of your User Content. By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, modify, adapt, publish, translate, distribute, and display your User Content in connection with operating and improving the Service.

This license continues even if you stop using the Service, but only for content that was shared publicly or with other users.

### Your Responsibilities

You represent and warrant that:
- You own or have the right to submit the User Content
- Your User Content does not violate any third-party rights
- Your User Content complies with these Terms and applicable laws

### Content Moderation

We may (but are not obligated to) review, remove, or disable access to User Content that:
- Violates these Terms
- Is reported by other users
- We determine is harmful or inappropriate

We are not responsible for User Content posted by users.

### DMCA/Copyright

[IF US-FOCUSED]

If you believe content on our Service infringes your copyright, please send a notice to:

**DMCA Agent:** [Name]
**Email:** [DMCA email]
**Address:** [Address]

Your notice must include:
1. Identification of the copyrighted work
2. Identification of the infringing material and its location
3. Your contact information
4. A statement that you have a good faith belief the use is not authorized
5. A statement, under penalty of perjury, that the information is accurate
6. Your physical or electronic signature

---

## Intellectual Property

### Our Content

The Service and its original content (excluding User Content), features, and functionality are owned by [COMPANY_NAME] and are protected by copyright, trademark, and other intellectual property laws.

Our name, logo, and all related names, logos, product names, and slogans are our trademarks. You may not use these without our prior written permission.

### Feedback

If you provide feedback, suggestions, or ideas about our Service, you grant us a non-exclusive, worldwide, royalty-free license to use and incorporate that feedback without any obligation to you.

---

## Third-Party Services

Our Service may contain links to or integrate with third-party websites, services, or content. We do not control and are not responsible for third-party services.

Your use of third-party services is governed by their terms and privacy policies. We encourage you to review their terms before using them.

---

## Disclaimers

**THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND**, either express or implied, including but not limited to:

- Implied warranties of merchantability
- Fitness for a particular purpose
- Non-infringement
- Accuracy, reliability, or completeness
- Uninterrupted or error-free operation

We do not warrant that:
- The Service will meet your requirements
- The Service will be available at all times
- Results from using the Service will be accurate
- Any errors will be corrected

Some jurisdictions do not allow exclusion of certain warranties, so some of the above may not apply to you.

---

## Limitation of Liability

**TO THE MAXIMUM EXTENT PERMITTED BY LAW**, [COMPANY_NAME], its officers, directors, employees, and agents shall not be liable for:

- Any indirect, incidental, special, consequential, or punitive damages
- Any loss of profits, revenue, data, or business opportunities
- Any damages arising from your use of or inability to use the Service
- Any damages arising from unauthorized access to your data
- Any damages exceeding the amount you paid us in the [12 months] preceding the claim

This limitation applies regardless of the legal theory (contract, tort, negligence, strict liability, or otherwise) and even if we have been advised of the possibility of such damages.

Some jurisdictions do not allow limitation of liability for certain damages, so some of the above may not apply to you.

---

## Indemnification

You agree to indemnify, defend, and hold harmless [COMPANY_NAME], its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:

- Your use of the Service
- Your violation of these Terms
- Your violation of any third-party rights
- Your User Content

---

## Termination

### By You

You may stop using the Service and delete your account at any time from your account settings, or by contacting us at [email].

### By Us

We may suspend or terminate your access to the Service:
- Immediately, without notice, for violations of these Terms
- With [30 days] notice for any other reason
- If we discontinue the Service

### Effect of Termination

Upon termination:
- Your right to use the Service ceases immediately
- We may delete your account and data after [X days]
- Provisions that should survive termination will survive (including intellectual property, disclaimers, limitations of liability, and dispute resolution)

---

## Dispute Resolution

[CHOOSE APPROACH - options below]

### Option A: Arbitration (US)

**PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.**

You and [COMPANY_NAME] agree to resolve any disputes through binding individual arbitration rather than in court.

**No Class Actions:** You agree to resolve disputes only on an individual basis and waive any right to participate in a class action lawsuit or class-wide arbitration.

**Arbitration Process:**
- Arbitration will be administered by [AAA/JAMS] under their rules
- Arbitration will take place in [location] or remotely
- The arbitrator's decision will be final and binding
- Judgment may be entered in any court of competent jurisdiction

**Exceptions:** Either party may bring claims in small claims court if they qualify.

**Opt-Out:** You may opt out of arbitration within 30 days of accepting these Terms by emailing [email] with "Arbitration Opt-Out" in the subject line.

### Option B: Courts Only

Any dispute arising from these Terms shall be resolved exclusively in the courts of [jurisdiction], and you consent to personal jurisdiction in these courts.

---

## Governing Law

These Terms shall be governed by the laws of [JURISDICTION], without regard to its conflict of law provisions.

[IF EU USERS]: If you are an EU consumer, you may also benefit from mandatory consumer protection laws in your country of residence.

---

## Changes to Terms

We may modify these Terms at any time. We will notify you of material changes by:
- Posting the updated Terms on this page
- Updating the "Last updated" date
- [If significant] Emailing registered users

Your continued use of the Service after changes take effect constitutes acceptance. If you do not agree to the new Terms, you must stop using the Service.

---

## General Provisions

### Entire Agreement
These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.

### Severability
If any provision is found to be unenforceable, the remaining provisions will continue in effect.

### Waiver
Our failure to enforce any right or provision does not constitute a waiver of that right or provision.

### Assignment
You may not assign your rights under these Terms without our written consent. We may assign our rights without restriction.

### Force Majeure
We are not liable for delays or failures resulting from circumstances beyond our reasonable control.

---

## Contact Us

If you have questions about these Terms, contact us:

**[COMPANY_NAME]**
Email: [LEGAL_EMAIL]
Address: [PHYSICAL_ADDRESS]
```

---

## Step 5: Implementation

### Create the Pages

**For Next.js App Router:**

```
app/
├── (legal)/
│   ├── layout.tsx          # Shared layout for legal pages
│   ├── privacy/page.tsx    # Privacy Policy
│   ├── terms/page.tsx      # Terms of Service
│   └── cookies/page.tsx    # Cookie Policy (or section in privacy)
```

**Example layout:**
```tsx
// app/(legal)/layout.tsx
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <article className="prose prose-gray dark:prose-invert max-w-none">
        {children}
      </article>
    </div>
  )
}
```

**Offer to create:**
1. The page files with generated content
2. Footer links to the legal pages
3. Cookie consent banner component (if needed)

---

## Step 6: Next Steps

Present to user after generation:

```markdown
## ✅ Legal Pages Generated

**Created:**
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/cookies` — Cookie Policy

## Required Next Steps

1. **Add footer links**
   - Link to Privacy Policy, Terms, and Cookies from your site footer

2. **Cookie consent banner** (if using non-essential cookies)
   - Required before setting analytics/marketing cookies
   - Must offer "Reject All" option for GDPR compliance
   - Consider: [CookieConsent](https://github.com/orestbida/cookieconsent), [Osano](https://www.osano.com/), or custom

3. **Legal review**
   - Have these documents reviewed by a lawyer, especially if:
     - You handle sensitive data (health, financial)
     - You have users in multiple jurisdictions
     - You're in a regulated industry
     - You process children's data

4. **Keep updated**
   - Update "Last updated" date when you make changes
   - Review annually at minimum
   - Update when you add new data collection or third-party services

5. **Data Subject Requests**
   - Set up a process to handle privacy requests (access, deletion, etc.)
   - Aim to respond within 30 days (GDPR requirement)
```

---

<progress_append>
After generating legal pages, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:legal
**Task:** Generate legal pages for [project]
**Outcome:** Created Privacy Policy, Terms of Service, Cookie Policy
**Files:**
- app/(legal)/privacy/page.tsx
- app/(legal)/terms/page.tsx
- app/(legal)/cookies/page.tsx
**Detection summary:**
- Auth: [what was detected]
- Analytics: [what was detected]
- Payments: [what was detected]
- Third parties: [list]
**User provided:**
- Company: [name]
- Jurisdiction: [location]
- Service type: [type]
**Compliance targets:** GDPR, CCPA, [others]
**Next:** Legal review, cookie consent banner, footer links

---
```
</progress_append>

---

## Interop

- Invoked by **/arc:letsgo** when legal documents are missing
- May invoke **cookie consent implementation** after generating Cookie Policy
- References project detection patterns shared with /arc:letsgo
