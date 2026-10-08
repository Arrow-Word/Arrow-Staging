ARROWORD TEST SITE — SAFE GUEST PREVIEW

This is a separate copy for testing. It does not change the live pages.

What it can do:
- Read the published puzzles from the live puzzle list so you can check the directory and solver.
- Let you try the builder, arrows, printing, and exporting.
- Keep guest answers and builder drafts in this browser only, under separate test-only browser storage.

What it cannot do:
- Sign in or save progress to an account.
- Publish, update, or delete puzzles.
- Save ratings, comments, or other changes to the live database.

To put this test site on GitHub:
1. Create a second GitHub repository for testing. Do not use the live repository.
2. Upload the contents of this folder into the top level of that new repository.
3. In the new repository, open Settings, then Pages. Choose deployment from the main branch and the root folder.
4. Open the test-site address GitHub shows you. Use that address to check the directory, solve puzzles as a guest, and try the builder.
5. The arrow check runs automatically when GitHub receives changes. Its results appear in the repository's Actions area.
6. Do not copy this guest-only folder over the live site. It deliberately contains test-only sign-in and publishing safeguards. When a change is approved, use clean live versions of the changed files; those can be prepared for you to upload yourself.

The preview only reads public puzzle information from Supabase; it does not write to any database. Guest answers and drafts use separate browser storage so they do not mix with the live site's local browser data.

The automatic check protects the arrow-placement code. It does not click through the pages for you; use the test-site address to check links and page behavior manually.
