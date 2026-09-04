# Galápagos Trip Site — Version 2 Setup

This version adds:

- Galápagos/travel imagery
- mobile navigation
- live countdown
- trip board
- 10-day itinerary
- activity proposals
- activity Going / Maybe sign-ups
- automatic activity head counts
- crew cards
- flight board
- Google Forms connection points
- optional Google Sheets live-data loading

The site works immediately with sample data. You can connect each Google Form/Sheet one at a time by editing `config.js`.

---

## 1. Upload Version 2 to GitHub Pages

In your existing `galapahoes` repository:

1. Replace the old site files with:
   - `index.html`
   - `style.css`
   - `app.js`
   - `config.js`
2. Commit the changes.
3. GitHub Pages should redeploy automatically.

---

## 2. Create one Google Spreadsheet

Create a spreadsheet named:

**Galapagos Trip 2026-27**

Create these tabs exactly.

### Announcements

| Date | Tag | Title | Body |
|---|---|---|---|

### Activities

| ID | Activity | Date | Time | ProposedBy | Description | Cost | Minimum | Status | Approved | Image |
|---|---|---|---|---|---|---|---|---|---|---|

Use activity IDs such as `A001`, `A002`, `A003`.

Set `Approved` to `YES` for anything you want displayed.

### Signups

| Timestamp | ActivityID | Name | People | Status |
|---|---|---|---|---|

Status should be:

- Going
- Maybe

### Crew

| Name | Note |
|---|---|

No child/kid fields are included.

### Flights

| Name | Arrival | ArrivalFlight | Departure | DepartureFlight |
|---|---|---|---|---|

---

## 3. Create four Google Forms

### A. Activity Proposal

Questions:

1. Your name
2. Activity name
3. Preferred date
4. Preferred time
5. Description
6. Estimated cost
7. Minimum people needed
8. Optional image/link
9. Notes for organizer

Recommended workflow: keep raw proposals in the Form's response sheet, review them, then copy approved activities into the `Activities` tab.

### B. Activity Signup

Questions:

1. Activity ID
2. Your name
3. Number of people
4. Status
   - Going
   - Maybe

### C. Crew

Questions:

1. Name
2. Optional note

### D. Flights

Questions:

1. Name
2. Arrival date/time
3. Arrival airline + flight number
4. Departure date/time
5. Departure airline + flight number

---

## 4. Connect the Forms

In each form:

1. Click **Send**
2. Choose the link icon
3. Copy the public `viewform` URL

Open `config.js` and paste the links here:

```js
forms: {
  activityProposal: "PASTE_URL",
  activitySignup: "PASTE_URL",
  crew: "PASTE_URL",
  flight: "PASTE_URL"
}
```

Commit `config.js`.

---

## 5. Publish Sheet tabs as CSV

For each display tab:

- Announcements
- Activities
- Signups
- Crew
- Flights

Use Google Sheets **File → Share → Publish to web** and publish the individual tab.

Paste the published CSV URLs into:

```js
data: {
  announcementsCsv: "...",
  activitiesCsv: "...",
  signupsCsv: "...",
  crewCsv: "...",
  flightsCsv: "..."
}
```

The site will then pull live data when it loads.

Important: published sheet tabs are public. Do not put sensitive information in those tabs.

---

## 6. Activity workflow

1. Friend clicks **Propose an activity**
2. Proposal goes to Google Form
3. Organizer reviews it
4. Organizer creates an `A###` ID
5. Organizer adds it to `Activities`
6. Set `Approved = YES`
7. Activity appears on the site
8. Friends click **I'm in** or **Maybe**
9. Signup data appears in `Signups`
10. Website calculates head counts automatically

---

## 7. Optional prefilled Activity ID

Google Forms can generate a prefilled form URL.

For the Activity Signup form:

1. Open the three-dot menu
2. Choose **Get pre-filled link**
3. Put `A001` into Activity ID
4. Generate the link
5. Find the URL parameter that looks like:

`entry.123456789=A001`

6. Put this in `config.js`:

```js
signupActivityEntry: "entry.123456789"
```

Then the site can automatically pass the right Activity ID.

---

## Privacy

Your GitHub Pages site is public.

Fine to publish:

- first names
- activity ideas
- general itinerary
- general group logistics

Keep private:

- full house address
- door/access codes
- passport details
- payment data
- private phone numbers
