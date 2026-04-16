# Liquid Gold Template - Setup Guide

Welcome! Your beautiful, professional portfolio is ready. Now let's get it working for you.

---

## STEP 1: Customize Your Content

Open `index1.html` in a text editor and find these sections:

- **Line 150:** Change "AXXILAK" to your name/business
- **Line 170:** Update the tagline
- **Line 340:** Add your contact info/social links

---

## STEP 2: Set Up Contact Form (Choose One Option)

You have two ways to receive inquiries. Choose what works best for you.

### OPTION A: DIY (Free, Full Control)

1. Go to **formspree.io**
2. Sign up with your email
3. Create a new form
4. Copy your form endpoint (looks like: `https://formspree.io/f/mxxxxxx`)
5. In `index1.html`, find line 343:
   ```html
   <form id="contact-form" action="[REPLACE_WITH_YOUR_FORMSPREE_ID]"
   ```
6. Replace `[REPLACE_WITH_YOUR_FORMSPREE_ID]` with your full Formspree endpoint
7. Save and deploy

**Pros:**
- Completely free
- Submissions go straight to your email
- Full control

**Cons:**
- You manage setup yourself
- 50 free submissions/month (then paid)
- Free tier limitations

---

### OPTION B: Managed ($5/month, We Handle It)

Use Axxilak's managed contact service.

1. Email **contact@axxilak.com** with subject: "Managed Contact Form"
2. We set up your form to route through our system
3. You receive inquiries in your Axxilak dashboard
4. $5/month (unlimited submissions)

**Pros:**
- We manage everything
- Dashboard view of all contacts
- Unlimited submissions
- Professional handling

**Cons:**
- Small monthly fee
- Submissions route through Axxilak (we don't share your data)

---

## STEP 3: Deploy Your Site

Once you've customized it and set up the contact form, deploy it:

### Easy Option: Netlify (Free)
1. Go to **netlify.com**
2. Drag your `liquid_gold_template` folder onto Netlify
3. Your site is live in 30 seconds at a Netlify URL
4. (Optional) Connect a custom domain

### Other Options:
- **Vercel** (similar to Netlify, also free)
- **Your own web host** (if you have one)
- **GitHub Pages** (for static sites)

---

## STEP 4: Test It

1. Open your live site
2. Fill out the contact form
3. Verify you receive the submission

---

## Questions?

For OPTION A setup help:
- [Formspree Documentation](https://formspree.io/site/docs)

For OPTION B (Managed Service):
- Email: **contact@axxilak.com**
- Subject: "Managed Contact Form Setup"

---

## Support

This template is yours to keep and modify forever.

Enjoy building! 🚀
