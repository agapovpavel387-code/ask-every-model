# Ask Every Model

[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

One question, many text models, side by side. Pollinations serves hundreds of
models from different labs through one API, so the app asks the selected models
the same question in parallel and shows every answer with its latency, token
count and cost.

**Live app:** https://agapovpavel387-code.github.io/ask-every-model/

## Bring your own Pollen

The app holds no key of its own. It signs you in with **Pollinations Connect**
(OAuth authorization-code flow with PKCE, run entirely in the browser) and asks
the question with the scoped key you approve on the consent screen:

- `client_id` is a publishable App Key (`pk_…`) — it names the app and can never spend;
- the user picks the budget cap (the link asks for 2 Pollen) and the expiry on the consent screen;
- the returned `sk_…` token lives in `sessionStorage` for the tab session only, never in `localStorage`;
- every generation is billed to the user's own Pollen.

Models that need paid Pollen answer with their notice instead of text, which is
what the cards show.

## How it works

1. `index.html` loads the live catalog from `gen.pollinations.ai/models?type=text` and shows a curated, affordable default set.
2. **Sign in with Pollinations** redirects to the consent screen with a PKCE challenge.
3. `callback.html` validates `state`, exchanges the code at `enter.pollinations.ai/api/oauth/token`, stores the token for the tab and returns to the app.
4. **Ask the selected models** posts the question to `gen.pollinations.ai/v1/chat/completions` once per model, in parallel, with the user's token.
5. The first visit shows `demo.json`: a real run fetched once by the maintainer (`tools/fetch-demo.mjs`), so the comparison is visible before signing in.

## Development

Static site, no build step. Serve the folder and open it:

```bash
python -m http.server 8000
# regenerate the example run (spends a little of your own Pollen)
POLLINATIONS_API_KEY=sk_... node tools/fetch-demo.mjs "Is a hotdog a sandwich? One sentence."
```

Registered redirect URIs for the App Key: the GitHub Pages callback above and
`http://localhost/callback.html`.

Quest: [pollinations/pollinations#19183](https://github.com/pollinations/pollinations/issues/19183)