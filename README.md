# FinanceApp — Nubank Expense Dashboard

I created this project because I wanted a simple way to see where my money is going every month. I import my Nubank credit card statements and the app automatically groups everything into categories so I can see at a glance if I'm overspending on food, transport, subscriptions, and so on.

The more people use and contribute to this, the better the auto-categorization gets for everyone.

## What it does

- Import one or multiple Nubank CSV exports at once
- Automatically categorizes every transaction by keyword matching
- Dashboard with total spent, breakdown by category (pie chart), monthly trend (bar chart), and top merchants
- Filter by month or category
- Click any category tag on a transaction to change it manually
- **Recategorizar** button re-applies all rules to existing data
- All data stays in your browser — nothing is sent to any server

## Your data is safe

This app uses **IndexedDB** (browser local storage) to store your transactions. No server, no database, no account required. Your financial data never leaves your computer. If you open the app on a different browser or device it starts fresh — your data only exists where you imported it.

## How to use

1. Open the app
2. Click **Importar extrato**
3. Export your Nubank invoice as CSV: Nubank app → Cartão de Crédito → select invoice → Exportar planilha
4. Upload the file (you can select multiple months at once)
5. Done — your dashboard is ready

## How to contribute

If you import your CSV and see transactions landing in **Outros** that should belong to a real category, you can help fix it for everyone by adding keywords.

### Step by step

1. Fork this repository
2. Open `lib/categorize.ts`
3. Find the right category section and add your keyword:

```ts
// Example: adding a regional supermarket
{ keyword: "nome do mercado", category: "Supermercado" },
```

4. Use Claude (or any AI) to speed this up — paste your CSV and say:

   > *"Read this CSV. Which transactions would be categorized as 'Outros'? Help me add the right keywords to `lib/categorize.ts` to fix them."*

5. Open a pull request describing which merchants you added and what category they belong to

### Guidelines

- Keywords are matched as substrings, case-insensitive, and accent-insensitive
- Put more specific keywords before generic ones (e.g. `"mercado livre"` before `"mercado"`)
- Avoid keywords shorter than 4 characters — they can accidentally match unrelated merchants
- When in doubt about the category, leave a comment in the PR

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- [Next.js](https://nextjs.org) — React framework
- [Dexie.js](https://dexie.org) — IndexedDB wrapper (client-side storage)
- [Recharts](https://recharts.org) — charts
- [Tailwind CSS](https://tailwindcss.com) — styling
- [date-fns](https://date-fns.org) — date formatting

---

Made by [@raryson](https://github.com/raryson) · [github.com/raryson/financial-app](https://github.com/raryson/financial-app)
