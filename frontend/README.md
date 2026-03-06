This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Automated Testing (Jest + React Testing Library)

CampusBazar frontend includes a modular automated test suite under `__tests__/`:

- `login.test.js`
- `register.test.js`
- `marketplace.test.js`
- `myProducts.test.js`
- `tutor.test.js`
- `chat.test.js`
- `payment.test.js`
- `notifications.test.js`
- `adminPanel.test.js`
- `api.test.js`

### Coverage focus

The suite covers realistic workflows for:

- authentication (login/register)
- marketplace listing and conditional states
- listing management (edit/delete/status/stock)
- tutor request flows
- chat interactions and message lifecycle
- eSewa checkout form behavior
- notifications display and read actions
- admin panel user-management workflows
- API contract/fallback behavior via mocked calls

### Intentional failing-demo cases

To demonstrate robustness and error handling without breaking CI, intentional negative demonstrations are implemented using `test.failing(...)`. This keeps the full suite executable while preserving explicit failure-oriented scenarios.

### Run tests

```bash
npm run test
npm run test:watch
```

`npm run test` executes with coverage output.
