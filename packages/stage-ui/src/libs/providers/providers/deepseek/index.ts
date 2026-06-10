import { createDeepSeek } from '@xsai-ext/providers/create'
import { z } from 'zod'

import { ProviderValidationCheck } from '../../types'
import { createOpenAICompatibleValidators } from '../../validators'
import { defineProvider } from '../registry'

type DeepSeekThinkingMode = 'auto' | 'disabled' | 'high' | 'max'

const deepSeekConfigSchema = z.object({
  apiKey: z
    .string('API Key'),
  baseUrl: z
    .string('Base URL')
    .optional()
    .default('https://api.deepseek.com/'),
  thinkingMode: z.enum(['auto', 'disabled', 'high', 'max'])
    .default('disabled'),
})

type DeepSeekConfig = z.input<typeof deepSeekConfigSchema>

function normalizeDeepSeekThinkingMode(value: unknown): DeepSeekThinkingMode {
  switch (value) {
    case 'auto':
    case 'disabled':
    case 'high':
    case 'max':
      return value
    default:
      return 'disabled'
  }
}

export function resolveDeepSeekThinkingOptions(modeRaw: unknown): Record<string, unknown> {
  const mode = normalizeDeepSeekThinkingMode(modeRaw)

  switch (mode) {
    case 'auto':
      return {}
    case 'disabled':
      return {
        thinking: { type: 'disabled' },
      }
    case 'high':
    case 'max':
      return {
        thinking: { type: 'enabled' },
        reasoning_effort: mode,
      }
    default:
      return {
        thinking: { type: 'disabled' },
      }
  }
}

export const providerDeepSeek = defineProvider<DeepSeekConfig>({
  id: 'deepseek',
  order: 4,
  name: 'DeepSeek',
  nameLocalize: ({ t }) => t('settings.pages.providers.provider.deepseek.title'),
  description: 'deepseek.com',
  descriptionLocalize: ({ t }) => t('settings.pages.providers.provider.deepseek.description'),
  tasks: ['chat'],
  icon: 'i-lobe-icons:deepseek',
  iconColor: 'i-lobe-icons:deepseek-color',

  createProviderConfig: ({ t }) => deepSeekConfigSchema.extend({
    apiKey: deepSeekConfigSchema.shape.apiKey.meta({
      labelLocalized: t('settings.pages.providers.catalog.edit.config.common.fields.field.api-key.label'),
      descriptionLocalized: t('settings.pages.providers.catalog.edit.config.common.fields.field.api-key.description'),
      placeholderLocalized: t('settings.pages.providers.catalog.edit.config.common.fields.field.api-key.placeholder'),
      type: 'password',
    }),
    baseUrl: deepSeekConfigSchema.shape.baseUrl.meta({
      labelLocalized: t('settings.pages.providers.catalog.edit.config.common.fields.field.base-url.label'),
      descriptionLocalized: t('settings.pages.providers.catalog.edit.config.common.fields.field.base-url.description'),
      placeholderLocalized: t('settings.pages.providers.catalog.edit.config.common.fields.field.base-url.placeholder'),
    }),
    thinkingMode: deepSeekConfigSchema.shape.thinkingMode.meta({
      labelLocalized: t('settings.pages.providers.catalog.edit.config.common.fields.field.thinking-mode.label'),
      descriptionLocalized: t('settings.pages.providers.catalog.edit.config.common.fields.field.thinking-mode.description'),
      section: 'advanced',
      type: 'select',
      options: [
        {
          label: t('settings.pages.providers.catalog.edit.config.common.fields.field.thinking-mode.options.auto'),
          value: 'auto',
        },
        {
          label: t('settings.pages.providers.catalog.edit.config.common.fields.field.thinking-mode.options.disable'),
          value: 'disabled',
        },
        {
          label: t('settings.pages.providers.catalog.edit.config.common.fields.field.thinking-mode.options.high'),
          value: 'high',
        },
        {
          label: 'Max',
          value: 'max',
        },
      ],
    }),
  }),
  createProvider(config) {
    const baseProvider = createDeepSeek(config.apiKey, config.baseUrl)

    return {
      ...baseProvider,
      chat(model: string) {
        return {
          ...baseProvider.chat(model),
          ...resolveDeepSeekThinkingOptions(config.thinkingMode),
        }
      },
    }
  },

  validationRequiredWhen(config) {
    return !!config.apiKey?.trim()
  },
  validators: {
    ...createOpenAICompatibleValidators({
      checks: [ProviderValidationCheck.Connectivity, ProviderValidationCheck.ModelList, ProviderValidationCheck.ChatCompletions],
    }),
  },
})
