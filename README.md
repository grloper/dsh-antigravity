# dsh-antigravity

<p align="center">
  <img src="./assets/images/chat-model-picker.png" alt="dsh-antigravity" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-antigravity"><img src="https://img.shields.io/npm/v/dsh-antigravity.svg" alt="npm version" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" /></a>
</p>

English | [简体中文](./README.zh.md)

Google Antigravity / Cloud Code Assist model provider for
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).

This is a DSH Web plugin. It registers a DSH `LlmAdapter`
under provider route `antigravity`, stores OAuth credentials under DSH home,
talks to the Cloud Code Assist streaming API directly, and provides full bilingual (English & Simplified Chinese) i18n support in the Web settings page.

> Unofficial integration. This project is not affiliated with or endorsed by
> Google. Use it only with accounts and services you are authorized to access.

## Install into DSH Web

### Option 1: From npm (Recommended)

```sh
dsh plugin --profile web add dsh-antigravity
```

### Option 2: Direct from GitHub

```sh
dsh plugin --profile web add github:grloper/dsh-antigravity
```

### Option 3: From Local Release Tarball

```sh
npm run pack:dist
dsh plugin --profile web add ./dist/dsh-antigravity-0.0.9.tgz
```

The package declares a DSH bundle patch, so installation automatically mounts
the host plugin and browser settings page.

If your DSH version does not support `dsh plugin add`, copy the package into
the Web profile manually:

```sh
cp -R dsh-antigravity "$DSH_HOME/profiles/web/node_modules/"
```

Then add the plugin to the profile `cordis.patch.yml`:

```yaml
- insert:
    - id: llm-antigravity
      name: dsh-antigravity
```

Restart DSH:

```sh
dsh web
```

## Login

Open **Settings > Antigravity** and click **Login**. The settings page starts
Google OAuth and refreshes quota after login completes.

![Antigravity Settings - Not Signed In](./assets/images/settings-not-signed-in.png)

After login, the settings page displays account information, quota grouped by model family, reset times, and model selector options:

- **Gemini Models** — Gemini Flash / Pro variants share one quota pool (green bars).
- **Claude and GPT models** — Claude Opus, Claude Sonnet, and GPT-OSS share a separate 3P quota pool (cyan bars).

Each group shows a **5-hour limit** (smooths short-term demand) and a **weekly limit** (tied to your subscription tier) with a live countdown to reset.

![Antigravity Settings - Signed In with Quota](./assets/images/settings-signed-in.png)

The plugin starts a loopback OAuth callback server at
`http://localhost:51121/oauth-callback`. If the Web service cannot open a
browser, run the terminal helper on the same machine:

```sh
node "$DSH_HOME/profiles/web/node_modules/dsh-antigravity/bin/antigravity-login.mjs"
```

Credentials are stored at:

```text
$DSH_HOME/storages/antigravity-oauth.json
```

Keep that file private. It contains access and refresh tokens.

## Proxy Settings

Open **Settings > Antigravity > Proxy Settings** to enable a dedicated proxy and enter the local HTTP proxy port (default `7890`). When enabled, Google OAuth token, account, quota, model-discovery, and chat-stream requests are routed through `http://127.0.0.1:<port>`. Changes apply to new requests immediately without restarting DSH.

The **Test connection** button probes Google OAuth through the port currently entered and reports the HTTP status and latency. This supports local HTTP/HTTPS CONNECT proxies only, not SOCKS ports. The Google authorization page opened in the browser continues to use the browser/system proxy.

The proxy configuration is stored at:

```text
$DSH_HOME/storages/antigravity-proxy.json
```

## Client version

Cloud Code Assist only serves requests whose `User-Agent` advertises a currently supported
Antigravity client. When it does not, the service **does not return an HTTP error**: it answers
with a plain-text notice ("This version of Antigravity is no longer supported…") delivered as the
completion body, so a pinned version rots into every reply looking like model output.

The adapter therefore resolves the version on every process start, newest source first:

1. `ANTIGRAVITY_CLIENT_VERSION` (or `NOAGY_CLIENT_VERSION`) — explicit override, e.g. `2.29.0`
2. the version of the locally installed Antigravity app, read from its `resources/app.asar`
3. a bundled fallback constant

`ANTIGRAVITY_USER_AGENT` (or `NOAGY_USER_AGENT`) still replaces the whole `User-Agent` string when
you need to mimic an exact client.

The notice is also detected before it can reach the transcript and re-raised as an error naming
the rejected version, so a future upstream gate fails loudly instead of silently answering with
marketing copy.

## Models

After login, select the **Antigravity** provider (`agy`) in DSH's model picker. Use the
model selector in **Settings > Antigravity** to enable or disable individual models — the
live remaining quota percentage is shown next to each one.

The catalog is deliberately small. **Only models verified to serve inference through Cloud
Code Assist appear here**; everything else the backend advertises is left out, because a
picker full of `404 model not found` is worse than a short list.

| Model ID | Name | Quota pool | Reasoning | Details |
|---|---|---|---|---|
| `gemini-3.8-flash` | Gemini 3.8 Flash (Argon) | Gemini | Low / Medium / High | 1M context, 65k output |
| `claude-opus-5-5` | Claude Opus 5.5 | Claude & GPT (3P) | Low / Medium / High | 1M context, 128k output |
| `claude-sonnet-5-5` | Claude Sonnet 5.5 | Claude & GPT (3P) | Low / Medium / High | 1M context, 128k output |

### Wire routing

DSH model IDs are stable names; the adapter maps them to the wire IDs the gateway accepts:

| Advertised model | Wire ID used |
|---|---|
| `gemini-3.8-flash` | `gemini-3.8-flash-tiered` |
| `claude-opus-5-5` | `claude-opus-5-5-{low,medium,high}` |
| `claude-sonnet-5-5` | `claude-sonnet-5-5-{low,medium,high}` |

`gemini-3.8-flash-low/-medium/-high` do **not** exist on the backend — they answer
`404 model not found`. Gemini 3.8 accepts effort through
`generationConfig.thinkingConfig.thinkingLevel` instead, so one wire ID serves all levels.

### Aliases

These are not shown in the picker, but resolve to a serving model so older sessions and
habitual names keep working:

`gemini-3.8-pro` · `argon` · `argon-3.8` · `argon-3.8-pro` · `argon-4` · `gemini-pro` ·
`gemini-3.1-pro` → `gemini-3.8-flash-tiered`
`claude-opus-4-6` → `claude-opus-5-5`
`claude-sonnet-4-6` → `claude-sonnet-5-5`

### Not offered, and why

| Model | Reason |
|---|---|
| `gemini-2.5-pro` | Backend answers `503 No capacity available` on every host |
| `gemini-3.1-pro`, `gemini-pro-agent` | `404 model not found` |
| `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3-flash` | `404 model not found` for this account |
| `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-3.1-flash-lite` | Serve, but are older/flash-lite tiers |
| `gpt-oss-120b` | Served, but not part of the Pro model set |
| `gemini-3.1-flash-image` | Image generation, not a chat model |

Models in the same quota pool share a weekly limit and a 5-hour limit. Quota is consumed
proportionally to token cost, so heavier models (e.g. Claude Opus) drain the pool faster.

For reasoning-capable models, the plugin requests upstream thoughts and maps streamed
thoughts to DSH `reasoning` content blocks. The effort remains selectable per message.


## License

MIT
