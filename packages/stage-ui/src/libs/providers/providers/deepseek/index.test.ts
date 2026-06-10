import { describe, expect, it } from 'vitest'

import { resolveDeepSeekThinkingOptions } from './index'

describe('DeepSeek provider thinking options', () => {
  it('disables thinking by default for low-latency MVP usage', () => {
    expect(resolveDeepSeekThinkingOptions(undefined)).toEqual({
      thinking: { type: 'disabled' },
    })
  })

  it('leaves provider defaults untouched in auto mode', () => {
    expect(resolveDeepSeekThinkingOptions('auto')).toEqual({})
  })

  it('maps high and max thinking modes to DeepSeek V4 request parameters', () => {
    expect(resolveDeepSeekThinkingOptions('high')).toEqual({
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
    })

    expect(resolveDeepSeekThinkingOptions('max')).toEqual({
      thinking: { type: 'enabled' },
      reasoning_effort: 'max',
    })
  })
})
