import test from 'node:test'
import assert from 'node:assert/strict'

import {
  MODELS,
  VALID_MODEL_IDS,
  DEFAULT_ENABLED_MODEL_IDS,
  ROUTING,
  resolveWireModel,
} from '../lib/model-catalog.js'

// The catalog is deliberately narrow: only models measured to serve inference through
// Cloud Code Assist for this subscription appear. A wider list is what produced a model
// picker full of 404s, so growth is a deliberate act with a test change.
const EXPECTED_IDS = ['gemini-3.8-flash', 'claude-opus-5-5', 'claude-sonnet-5-5']

test('the catalog contains exactly the models that serve', () => {
  assert.deepEqual(MODELS.map((model) => model.id), EXPECTED_IDS)
  assert.deepEqual([...VALID_MODEL_IDS].sort(), [...EXPECTED_IDS].sort())
  assert.deepEqual([...DEFAULT_ENABLED_MODEL_IDS].sort(), [...EXPECTED_IDS].sort())
})

test('every model declares the metadata the picker needs', () => {
  for (const model of MODELS) {
    assert.equal(typeof model.name, 'string', `${model.id} needs a display name`)
    assert.ok(model.name.length > 0, `${model.id} name must not be empty`)
    assert.deepEqual(model.inputModalities, ['text', 'image'], `${model.id} modalities`)
    assert.ok(model.contextWindow >= 200_000, `${model.id} context window`)
    assert.ok(model.maxTokens > 1024, `${model.id} max output tokens`)
    assert.ok(model.reasoningEfforts.length > 0, `${model.id} reasoning efforts`)
    assert.ok(model.reasoningEfforts.includes(model.defaultEffort), `${model.id} default effort must be advertised`)
  }
})

test('every routed wire id has an output-token budget', async () => {
  const { RUNTIME_MAX_OUTPUT_TOKENS } = await import('../lib/model-catalog.js')
  for (const model of MODELS) {
    for (const effort of model.reasoningEfforts) {
      const wire = resolveWireModel(model.id, effort)
      assert.ok(RUNTIME_MAX_OUTPUT_TOKENS[wire] !== undefined, `${model.id}/${effort} -> ${wire} has no max-output entry`)
    }
  }
})

test('routing resolves Gemini 3.8 to the tiered wire id', () => {
  // -low / -medium / -high are rejected by the backend with "model not found".
  for (const effort of ['low', 'medium', 'high', 'off', undefined]) {
    assert.equal(resolveWireModel('gemini-3.8-flash', effort), 'gemini-3.8-flash-tiered')
  }
})

test('routing splits Claude models by effort', () => {
  assert.equal(resolveWireModel('claude-opus-5-5', 'low'), 'claude-opus-5-5-low')
  assert.equal(resolveWireModel('claude-opus-5-5', 'medium'), 'claude-opus-5-5-medium')
  assert.equal(resolveWireModel('claude-opus-5-5', 'high'), 'claude-opus-5-5-high')
  assert.equal(resolveWireModel('claude-sonnet-5-5', 'low'), 'claude-sonnet-5-5-low')
  assert.equal(resolveWireModel('claude-sonnet-5-5', 'high'), 'claude-sonnet-5-5-high')
})

test('an unknown effort falls back to the strongest advertised level', () => {
  assert.equal(resolveWireModel('claude-sonnet-5-5', 'nonsense'), 'claude-sonnet-5-5-high')
  assert.equal(resolveWireModel('claude-sonnet-5-5', 'xhigh'), 'claude-sonnet-5-5-high')
})

test('legacy and friendly aliases resolve to a serving model', () => {
  const aliases = ['gemini-3.8-pro', 'argon', 'argon-3.8', 'argon-3.8-pro', 'argon-4', 'gemini-pro', 'gemini-3.1-pro']
  for (const alias of aliases) {
    const wire = resolveWireModel(alias, 'medium')
    assert.equal(wire, 'gemini-3.8-flash-tiered', `${alias} should resolve to the Gemini 3.8 wire id`)
  }
  for (const alias of ['claude-opus-4-6', 'claude-sonnet-4-6']) {
    const wire = resolveWireModel(alias, 'high')
    assert.ok(wire.endsWith('-high'), `${alias} should resolve to a high-tier Claude wire id`)
  }
})

test('a retired model is routed to something that serves', () => {
  // gemini-2.5-pro answers 503 "No capacity available"; it must not be offered, and a
  // stored session naming it must still resolve.
  assert.equal(VALID_MODEL_IDS.has('gemini-2.5-pro'), false)
  assert.equal(resolveWireModel('gemini-2.5-pro', 'medium'), 'gemini-3.8-flash-tiered')
})

test('an unknown model passes through so the caller sees a real error', () => {
  assert.equal(resolveWireModel('totally-not-a-model', 'high'), 'totally-not-a-model')
})

test('no model routes to a wire id that is not in the max-output table', () => {
  for (const [modelId, route] of Object.entries(ROUTING)) {
    const targets = [route.off, route.defaultRequestId, ...Object.values(route.routing ?? {})]
    for (const target of targets) {
      assert.equal(typeof target, 'string', `${modelId} has an empty routing target`)
      assert.ok(target.length > 0, `${modelId} routes to an empty string`)
    }
  }
})
