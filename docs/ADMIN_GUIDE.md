# Team guide (Admin, Sales, Verifier)

Log in at **https://app.devnixplus.com/accounts/login/** and open **Team panel** (`/manage/`).

| Role | Can |
|---|---|
| **Admin** | Everything: settings, refunds, suspend/reactivate, restore versions, templates, audit log |
| **Sales** | Leads (notes, follow-ups, Call/WhatsApp, CSV export), projects (view), payments (view) |
| **Verifier** | Verification queue (approve/reject), go live, domains, projects, abuse reports |

Give someone a role: `/django-admin/` → Users → the user → tick **Staff status** and add the group (Admin, Sales or Verifier). Run `manage.py setup_roles` once if the groups are missing.

## Verify a business

1. **Verification** shows every paid project waiting for a decision. Red "Priority" badges mean the text uses a sensitive word (bank, police, loan…): check those first.
2. Click **Review**. You see the live preview, the owner, the Google Maps link, the GST/Udyam number and the shop photo / visiting card.
3. Check: the Maps listing exists, matches the name/address/phone on the website, and the owner is reachable. Call them if in doubt (`tel:` link on the page).
4. **Approve**, or write a reason and **Reject + refund**. Rejecting refunds every payment for that project through Razorpay automatically and takes the preview down. The owner gets the reason by email and WhatsApp.

**Insurance & investment advisors** (category `insurance`): also ask for the IRDAI licence (agent code) and, for mutual funds, the AMFI ARN, and check the ARN on amfiindia.com. Open a couple of the referral links on the site: they must go to a real insurer, aggregator or fund platform, never to a payment page or an app download from an unknown source. The legal disclaimer in the footer must stay.

If the owner paid but didn't send the form, the page says "Waiting for owner": call them, or reject with a reason.

## Go live (hosted plan)

After approval the status is **Approved**. Open the project and click **Go live**. The site is republished without the Preview ribbon and noindex, hosting runs for one year from today, and the owner is told. From then on every edit the owner saves is published instantly.

## Connect a customer's own domain

1. Ask the customer to add, at their registrar: `A @ → SERVER_IP` and `A www → SERVER_IP`.
2. In the project page, enter the domain under **Custom domain**, tick **DNS points to our server** once `dig +short their-domain.com` shows our IP, and save.
3. The page now shows the **Nginx server block** and the **commands**. On the server: run the certbot command, paste the block into `/etc/nginx/sites-available/<domain>.conf`, enable it, `sudo nginx -t && sudo systemctl reload nginx`.
4. Open `https://<domain>/`. Tick **SSL certificate issued** and **Checked in a browser** and save: the site is republished with the domain in its canonical and Open Graph tags, and the dashboard shows the new address.

## Refunds

- Automatic on **Reject**.
- Manual: **Payments** → **Refund** (Admin). A refund either completes at once ("Refunded") or shows "Refund pending" until Razorpay's `refund.processed` webhook arrives. "Refund failed" shows the API error: retry later or refund from the Razorpay dashboard.
- Demo payments (simulator) are marked **demo** and are refunded instantly without Razorpay.

## Suspend a site

Project page → reason → **Suspend** (Admin). The site shows "temporarily unavailable"; data is kept and the owner can't edit. **Reactivate** restores the previous status and republishes.
Abuse reports from the "Report this website" footer link appear under **Abuse reports**; mark them reviewed/actioned there.

## Restore an older version

Project page → **Versions** → **Restore** on any earlier version (Admin). It is validated again, saved as a new version and published. Autosaves within 2 minutes share one version, so the 30 kept versions cover real editing sessions.

## Follow up leads

- **Leads** lists every registered owner with business, city, mobile, funnel stage (Signed up → Project created → Data filled → Preview opened → Paid → Live), last activity and consent.
- Filter by stage, category, city, consent or "Follow-up due"; search by name, mobile, email or business.
- **Call** opens the dialer; **WhatsApp** opens a chat with a ready message ("Namaste {name}, this is Devnixplus. Your website for {business} is ready to go live…").
- Open a lead to add a **note** with a **follow-up date**. Due follow-ups appear at the top of Leads and in the sidebar count; click **Done** when finished.
- Rows in red have **no contact consent**: don't call or message them. **Export leads** includes everyone with their consent flags; **Marketing export** only includes owners who agreed to marketing.

## Settings

**Settings** (Admin): prices (shown everywhere, never hard-coded), reminder days, grace period, preview expiry, max websites per owner, photo storage per owner, verification switches, sensitive words, support WhatsApp/phone/email. Every change is written to the **Audit log**.

## Templates

**Templates**: switch designs on/off, change their order, or **Re-import** after editing a `demos/sample-*/data.js` (run `tools/build_showcase.py` first to refresh the thumbnail).
