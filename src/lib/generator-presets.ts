import { GeneratorConfig } from './mock-generator'

export interface ScenarioPreset {
  id: string
  name: string
  tagline: string
  config: Omit<GeneratorConfig, 'dateRange'>
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'card-testing-attack',
    name: 'Card Testing Attack',
    tagline: 'Classic bot probe — burst of tiny failures',
    config: {
      count: 250,
      processors: ['stripe', 'paypal'],
      fraudMix: {
        cardTesting: 30,
        velocityFraud: 0,
        highRiskCountry: 0,
        roundNumber: 0,
        retryAttack: 10,
        cryptoFraud: 0,
        nightTime: 0,
        highValue: 0,
        legitimate: 60,
      },
      statusDistribution: {
        succeeded: 40,
        failed: 50,
        pending: 7,
        canceled: 3,
      },
    },
  },
  {
    id: 'money-movement',
    name: 'Money Movement',
    tagline: 'Laundering / cash-out pattern',
    config: {
      count: 180,
      processors: ['stripe', 'adyen'],
      fraudMix: {
        cardTesting: 0,
        velocityFraud: 0,
        highRiskCountry: 15,
        roundNumber: 15,
        retryAttack: 0,
        cryptoFraud: 20,
        nightTime: 0,
        highValue: 0,
        legitimate: 50,
      },
      statusDistribution: {
        succeeded: 80,
        failed: 10,
        pending: 8,
        canceled: 2,
      },
    },
  },
  {
    id: 'velocity-burst',
    name: 'Velocity Burst',
    tagline: 'Compromised account on a spree',
    config: {
      count: 200,
      processors: ['stripe'],
      fraudMix: {
        cardTesting: 0,
        velocityFraud: 25,
        highRiskCountry: 0,
        roundNumber: 0,
        retryAttack: 0,
        cryptoFraud: 0,
        nightTime: 10,
        highValue: 0,
        legitimate: 65,
      },
      statusDistribution: {
        succeeded: 75,
        failed: 15,
        pending: 8,
        canceled: 2,
      },
    },
  },
  {
    id: 'quiet-week',
    name: 'Quiet Week, One Bad Actor',
    tagline: 'Needle-in-haystack demo',
    config: {
      count: 400,
      processors: ['stripe', 'paypal', 'adyen'],
      fraudMix: {
        cardTesting: 3,
        velocityFraud: 0,
        highRiskCountry: 0,
        roundNumber: 0,
        retryAttack: 5,
        cryptoFraud: 0,
        nightTime: 0,
        highValue: 0,
        legitimate: 92,
      },
      statusDistribution: {
        succeeded: 85,
        failed: 10,
        pending: 4,
        canceled: 1,
      },
    },
  },
  {
    id: 'kitchen-sink',
    name: 'Kitchen Sink',
    tagline: 'Grand-tour demo — every card lights up',
    config: {
      count: 300,
      processors: ['stripe', 'paypal', 'adyen'],
      fraudMix: {
        cardTesting: 7,
        velocityFraud: 7,
        highRiskCountry: 7,
        roundNumber: 7,
        retryAttack: 7,
        cryptoFraud: 7,
        nightTime: 7,
        highValue: 7,
        legitimate: 44,
      },
      statusDistribution: {
        succeeded: 65,
        failed: 25,
        pending: 7,
        canceled: 3,
      },
    },
  },
]

export function applyPreset(preset: ScenarioPreset): GeneratorConfig {
  const end = new Date()
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
  return {
    ...preset.config,
    dateRange: { start, end },
  }
}
