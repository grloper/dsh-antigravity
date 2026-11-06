import test from 'node:test'
import assert from 'node:assert/strict'

import {
  asarPackageVersion,
  antigravityClientVersion,
  couldBecomeClientVersionNotice,
  defaultUserAgent,
  isClientVersionNotice,
} from '../lib/index.js'

// Cloud Code Assist gates on the Antigravity client version in the User-Agent. A stale
// version is not an HTTP error: the service returns the "no longer supported" notice as
// completion text, which silently replaced every answer. These tests pin the two things
// that made that expensive to notice: the pinned version, and treating the notice as text.
const STALE_VERSION = '1.15.8'

test('the advertised client version is a concrete semver', () => {
  const version = antigravityClientVersion()
  assert.match(version, /^\d+\.\d+\.\d+$/, `unexpected client version "${version}"`)
  assert.notEqual(version, STALE_VERSION, 'regressed to the client version upstream rejects')
})

test('the user agent carries that version, the os and the arch', () => {
  const userAgent = defaultUserAgent()
  assert.match(userAgent, /^antigravity\/\d+\.\d+\.\d+ [a-z]+\/[a-z0-9]+$/, userAgent)
  assert.ok(userAgent.includes(antigravityClientVersion()), userAgent)
})

test('a missing archive is not fatal', () => {
  assert.equal(asarPackageVersion('/definitely/not/here/app.asar'), undefined)
})

test('the unsupported-client notice is recognised', () => {
  const notice =
    'This version of Antigravity is no longer supported. Please download and install the latest ' +
    'version at https://antigravity.google/download to continue using the agent and unlock our ' +
    'latest models, including Gemini 4 Argon on eligible plans.'
  assert.equal(isClientVersionNotice(notice), true)
  assert.equal(couldBecomeClientVersionNotice('This version of Antigravity is no long'), true)
})

test('ordinary model output is neither held back nor mistaken for the notice', () => {
  assert.equal(isClientVersionNotice('PONG'), false)
  assert.equal(isClientVersionNotice('This version is supported'), false)
  assert.equal(couldBecomeClientVersionNotice('PONG'), false)
  assert.equal(couldBecomeClientVersionNotice('This is a normal answer that starts similarly'), false)
})
