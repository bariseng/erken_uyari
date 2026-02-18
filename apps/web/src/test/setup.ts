import '@testing-library/jest-dom'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'tr',
  useTranslations: () => (key: string) => key,
}))

// Mock next/link
vi.mock('next/link', () => {
  const React = require('react')
  return {
    default: ({ children, href, ...props }: any) => {
      return React.createElement('a', { href, ...props }, children)
    },
  }
})

// Mock KaTeX CSS
vi.mock('katex/dist/katex.min.css', () => ({}))

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => {
  const React = require('react')
  const mock = (name: string) => ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': `recharts-${name}`, ...props }, children)
  return {
    ResponsiveContainer: mock('responsive-container'),
    BarChart: mock('bar-chart'),
    Bar: mock('bar'),
    LineChart: mock('line-chart'),
    Line: mock('line'),
    ScatterChart: mock('scatter-chart'),
    Scatter: mock('scatter'),
    AreaChart: mock('area-chart'),
    Area: mock('area'),
    XAxis: mock('x-axis'),
    YAxis: mock('y-axis'),
    CartesianGrid: mock('cartesian-grid'),
    Tooltip: mock('tooltip'),
    Legend: mock('legend'),
    ReferenceLine: mock('reference-line'),
    Cell: mock('cell'),
  }
})

// Mock jspdf
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    addPage: vi.fn(),
  })),
}))

// Mock jspdf-autotable
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
