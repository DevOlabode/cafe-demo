# Bramble & Rye Café and Bakery (demo)

A demo website for a made-up café and bakery in St. Albert, Alberta. Built by Samuel Olabode to show local cafés and restaurants what a simple, mobile-friendly site looks like.

Plain HTML, CSS and JavaScript. No build step. Headings use DM Serif Display from Google Fonts (falls back to Georgia).

## Features

- Full menu as real text (not an image), so Google and phones can read it. Sticky section links and filters for Vegetarian, Gluten-free and Dairy-free options.
- "Open now / Closed" status and today's soup, worked out in Edmonton time. Today's row is highlighted in the hours table.
- Order-ahead form with quantity steppers and a running total. Pickup days and times are built from the opening hours: same-day orders only before 10 am (pickup from 1 pm), and orders over $150 need 48 hours. Nothing is sent; it shows a demo message.
- About section, FAQ, Google map of St. Albert, sticky Menu / Order ahead bar on phones.

## Files

- `index.html`: the page and the menu content
- `styles.css`: all styles (mobile-first, breakpoints at 640px and 960px)
- `script.js`: menu filters, hours and soup of the day, order form

To change the soups, edit the `SOUPS` list in `script.js`. To change hours, edit `HOURS` in `script.js` and the hours table in `index.html`.

## Deploy on Vercel

Push to GitHub, import the repo in Vercel, framework preset "Other", no build command. Or run `npx vercel` in this folder.

## Before sharing

- Check it on your phone and make sure the photos load.
- Photos are hotlinked from Unsplash (free Unsplash License). For reliability, download them into an `images/` folder and update the `src` paths.
- The address and owner are made up. Every text link goes to your real number, (825) 461-1264.
- Keep `<meta name="robots" content="noindex">` so the fake business stays out of Google.

## Photo credits (Unsplash)

Clifford (hero), Anisa Cakesandbakes, Ken S, Oscar Nord, Keghan Crossland, Petr Sevcovic.
