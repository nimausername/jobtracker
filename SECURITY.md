# Security Policy

## Supported versions

Security fixes are applied on the default branch of this repository.

## Reporting a vulnerability

If you find a security issue in Job Tracker (auth bypass, data leak between
users, injection, secret exposure, and similar):

1. **Do not** open a public GitHub issue.
2. Email the maintainer privately with:
   - a short description
   - steps to reproduce
   - impact assessment
   - any suggested fix

We will acknowledge the report and work on a fix before any public disclosure.

## Safe contribution rules

- Never commit `.env`, Keycloak client secrets, or database credentials.
- Prefer least-privilege Keycloak roles for the API client.
- Keep application and note queries scoped to the authenticated user id.
