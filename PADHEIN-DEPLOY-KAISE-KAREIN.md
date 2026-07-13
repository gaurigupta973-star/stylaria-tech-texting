# NOVA Backend — Deploy kaise karein (Vercel)

Ye backend Vercel pe **free** mein deploy hoga. Do endpoints hain:
- `/api/chat` — NOVA ke chat replies (Claude AI se)
- `/api/contact` — contact form ki email

## Step 1 — Zaroori accounts bana lein (5 min)
1. **Vercel account**: https://vercel.com/signup (GitHub se signup karna sabse aasan hai)
2. **Anthropic API key**: https://console.anthropic.com → Settings → API Keys → "Create Key"
   - Isme thoda balance daalna padega (credit card) — chat ke liye bohot sasta hai (Haiku model paise ke hisaab se bahut kam kharcha karta hai)
3. **Gmail App Password** (contact form ke emails ke liye):
   - Google Account → Security → 2-Step Verification **ON** karein (agar pehle se nahi hai)
   - Phir https://myaccount.google.com/apppasswords pe jaake ek App Password banayein
   - Ye 16-digit code save kar lein

## Step 2 — Ye folder GitHub pe daalein
1. GitHub.com pe login karke **New Repository** banayein (naam jo chahe, e.g. `stylaria-nova-backend`)
2. Is poore `nova-backend` folder ko us repository mein upload kar dein
   - GitHub website pe hi "Add file → Upload files" se seedha drag-drop kar sakte hain, terminal ki zaroorat nahi

## Step 3 — Vercel pe import karein
1. https://vercel.com/new pe jaayein
2. Apni GitHub repository select karein ("Import")
3. **Environment Variables** section mein ye 5 cheezein add karein (`.env.example` file mein naam likhe hain):
   - `ANTHROPIC_API_KEY`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `CONTACT_TO_EMAIL`
   - `ALLOWED_ORIGIN` — abhi ke liye `*` daal dein, baad mein apni real site ka URL daal denge
4. **Deploy** button dabayein — 1-2 minute mein live ho jaayega

Deploy hone ke baad Vercel ek URL dega jaise:
```
https://stylaria-nova-backend.vercel.app
```

## Step 4 — Website ko is backend se jodein
`combined-footer-js.js` file load hone se **PEHLE** ye chhota sa script WordPress mein add karna hai
(WPCode mein **naya alag snippet** banayein, "Insert Before" ya usi footer snippet mein sabse **upar** paste karein):

```html
<script>
  window.STYLARIA_CONFIG = { apiBase: "https://stylaria-nova-backend.vercel.app" };
</script>
```

**Zaroori**: Ye line `combined-footer-js.js` wale content se **upar/pehle** honi chahiye, warna kaam nahi karega.

## Step 5 — CORS lock karein (security)
Test karne ke baad, Vercel Project → Settings → Environment Variables mein jaake
`ALLOWED_ORIGIN` ki value `*` se badalkar apni asli site ka URL kar dein, jaise:
```
https://stylariatech.com
```
Phir Vercel pe **Redeploy** kar dein (Deployments tab → latest → "..." → Redeploy).

## Step 6 — Test karein
1. Site kholein, NOVA chat kholkar kuch pooch kar dekhein — AI reply aana chahiye
2. Contact form fill karke submit karein — apne Gmail inbox mein email aana chahiye

## Kharcha (rough idea)
- Vercel hosting: free (personal/small business use ke liye)
- Gmail: free
- Anthropic API: sirf jitna use hoga utna hi charge — chat messages ke liye typically paise ke hisaab se bahut kam (paisa dollars mein nahi, cents mein sochiye per sau messages)
