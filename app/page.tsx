'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronDown, ChevronUp, ArrowUp, School, MapPin, X, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

const regions = [
  {
    key: 'ns',
    name: 'North Shore',
    base: 'NorthShore',
    schools: [
      { name: 'Long Bay School', folder: 'LongBaySchool', id: 1342 },
      { name: 'Glamorgan School', folder: 'GlamorganSchool', id: 1283 },
      { name: 'Torbay School', folder: 'TorbaySchool', id: 1538 },
      { name: 'Sherwood School', folder: 'SherwoodSchool', id: 1481 },
      { name: 'Ōteha Valley School', folder: 'OtehaValleySchool', id: 6946 },
      { name: 'Browns Bay School', folder: 'BrownsBaySchool', id: 1237 },
      { name: 'Pinehill School', folder: 'PinehillSchool', id: 6932 },
      { name: 'Murrays Bay School', folder: 'MurraysBaySchool', id: 1387 },
      { name: 'Mairangi Bay School', folder: 'MairangiBaySchool', id: 1343 },
      { name: 'Sunnynook School', folder: 'SunnynookSchool', id: 1518 },
      { name: 'Campbells Bay School', folder: 'CampbellsBaySchool', id: 1242 },
      { name: 'Forrest Hill School', folder: 'ForrestHillSchool', id: 1278 },
      { name: 'Milford School', folder: 'MilfordSchool', id: 1375 },
      { name: 'Takapuna School', folder: 'TakapunaSchool', id: 1525 },
      { name: 'Hauraki School', folder: 'HaurakiSchool', id: 1304 },
      { name: 'Belmont School', folder: 'BelmontSchool', id: 1226 },
      { name: 'Bayswater School', folder: 'BayswaterSchool', id: 1221 },
      { name: 'Vauxhall School', folder: 'VauxhallSchool', id: 1541 },
      { name: 'Stanley Bay School', folder: 'StanleyBaySchool', id: 1512 },
      { name: 'Devonport School', folder: 'DevonportSchool', id: 1260 },
      { name: 'Upper Harbour School', folder: 'UpperHarbourSchool', id: 6955 },
      { name: 'Greenhithe School', folder: 'GreenhitheSchool', id: 1299 }
    ]
  },
  {
    key: 'ac',
    name: 'Auckland City',
    base: 'AucklandCity',
    schools: [
      { name: 'Mount Eden Normal School', folder: 'MtEdenNormalSchool', id: 1378 },
      { name: 'Cornwall Park District School', folder: 'CornwallParkDistrictSchool', id: 1256 },
      { name: 'Remuera School', folder: 'RemueraSchool', id: 1462 },
      { name: 'Meadowbank School', folder: 'MeadowbankSchool', id: 1370 },
      { name: 'Victoria Avenue School', folder: 'VictoriaAvenueSchool', id: 1544 },
      { name: 'Newton Central School', folder: 'NewtonCentralSchool', id: 1392 }
    ]
  },
  {
    key: 'wc',
    name: 'Waitakere City',
    base: 'WaitakereCity',
    schools: [{ name: 'Hobsonville Point Primary School', folder: 'HobsonvillePointSchool', id: 6788 }]
  }
] as const

type RegionKey = (typeof regions)[number]['key']

const totalSchools = regions.reduce((sum, r) => sum + r.schools.length, 0)

const regionColors: Record<RegionKey, { bg: string; text: string; border: string; badge: string; headerBg: string }> = {
  ns: {
    bg: 'bg-ns',
    text: 'text-ns',
    border: 'border-ns',
    badge: 'bg-ns text-ns-foreground',
    headerBg: 'bg-ns text-ns-foreground'
  },
  ac: {
    bg: 'bg-ac',
    text: 'text-ac',
    border: 'border-ac',
    badge: 'bg-ac text-ac-foreground',
    headerBg: 'bg-ac text-ac-foreground'
  },
  wc: {
    bg: 'bg-wc',
    text: 'text-wc',
    border: 'border-wc',
    badge: 'bg-wc text-wc-foreground',
    headerBg: 'bg-wc text-wc-foreground'
  }
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [activeRegion, setActiveRegion] = useState<'all' | RegionKey>('all')
  const [showBackTop, setShowBackTop] = useState(false)
  const [allOpen, setAllOpen] = useState<boolean | null>(null)
  const [toggleKey, setToggleKey] = useState(0)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleAll = useCallback((open: boolean) => {
    setAllOpen(open)
    setToggleKey((k) => k + 1)
  }, [])

  const filteredRegions = regions
    .filter((r) => activeRegion === 'all' || activeRegion === r.key)
    .map((r) => ({
      ...r,
      schools: r.schools.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    }))
    .filter((r) => r.schools.length > 0)

  const shownCount = filteredRegions.reduce((sum, r) => sum + r.schools.length, 0)

  const tabs = [
    { key: 'all' as const, label: '全部', count: totalSchools },
    ...regions.map((r) => ({ key: r.key, label: r.name, count: r.schools.length }))
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="bg-linear-to-br from-hero to-hero-light px-4 py-8 text-center text-white md:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur-sm md:mb-3 md:px-4 md:py-1.5 md:text-sm">
            <School className="size-3.5 md:size-4" />
            <span>Auckland Primary Schools</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight md:text-4xl">奥克兰小学统计数据与学生人口一览</h1>
          <div className="mt-4 flex items-center justify-center gap-6 md:mt-6 md:gap-10">
            <div className="text-center">
              <div className="text-2xl font-bold md:text-3xl">{totalSchools}</div>
              <div className="mt-0.5 text-[11px] text-white/75 md:mt-1 md:text-xs">学校总数</div>
            </div>
            <div className="h-6 w-px bg-white/25 md:h-8" />
            <div className="text-center">
              <div className="text-2xl font-bold md:text-3xl">{regions.length}</div>
              <div className="mt-0.5 text-[11px] text-white/75 md:mt-1 md:text-xs">覆盖区域</div>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="sticky top-0 z-50 border-b bg-background/95 px-4 py-2.5 backdrop-blur-md md:py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:gap-3">
          {/* Row 1 on mobile: search + action buttons */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索学校名称…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="size-9 md:hidden"
                onClick={() => toggleAll(true)}
                aria-label="全部展开"
              >
                <ChevronDown className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-9 md:hidden"
                onClick={() => toggleAll(false)}
                aria-label="全部折叠"
              >
                <ChevronUp className="size-4" />
              </Button>
            </div>
          </div>

          {/* Row 2 on mobile: tabs + count */}
          <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex shrink-0 gap-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveRegion(tab.key)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all md:gap-1.5 md:px-3.5 md:text-sm',
                    activeRegion === tab.key
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] leading-none md:text-[11px]',
                      activeRegion === tab.key ? 'bg-white/25' : 'bg-muted'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <span className="shrink-0 text-xs text-muted-foreground md:text-sm">
              {shownCount}/{totalSchools}
            </span>
          </div>

          {/* Desktop-only expand/collapse buttons */}
          <div className="hidden gap-1.5 md:flex">
            <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
              <ChevronDown className="size-3.5" />
              全部展开
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>
              <ChevronUp className="size-3.5" />
              全部折叠
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-5 md:py-8">
        {filteredRegions.length === 0 && (
          <div className="py-16 text-center text-muted-foreground md:py-20">
            <Search className="mx-auto mb-3 size-8 opacity-30 md:size-10" />
            <p className="text-base font-medium md:text-lg">没有找到匹配的学校</p>
            <p className="mt-1 text-xs md:text-sm">尝试调整搜索关键词或切换区域</p>
          </div>
        )}

        {filteredRegions.map((region) => {
          const colors = regionColors[region.key]
          return (
            <section key={region.key} className="mb-7 md:mb-10">
              <div
                className={cn(
                  'mb-3 flex items-center gap-2 border-b-[3px] pb-2 md:mb-5 md:gap-3 md:pb-3',
                  colors.border
                )}
              >
                <MapPin className={cn('size-4 md:size-5', colors.text)} />
                <h2 className="text-base font-bold md:text-xl">{region.name}</h2>
                <Badge className={cn('rounded-full border-0 text-[10px] md:text-xs', colors.badge)}>
                  {region.schools.length} 所学校
                </Badge>
              </div>

              <div className="flex flex-col gap-3 md:gap-5">
                {region.schools.map((school, i) => (
                  <SchoolCard
                    key={`${school.folder}-${toggleKey}`}
                    school={school}
                    regionKey={region.key}
                    regionBase={region.base}
                    index={i}
                    defaultOpen={allOpen ?? false}
                    onImageClick={setLightbox}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </main>

      {/* Back to top */}
      <Button
        size="icon"
        className={cn(
          'fixed bottom-4 right-4 z-50 size-10 rounded-full shadow-lg transition-all duration-300 md:bottom-6 md:right-6 md:size-11',
          showBackTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        )}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp className="size-4 md:size-5" />
      </Button>

      {/* Lightbox */}
      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </div>
  )
}

function SchoolCard({
  school,
  regionKey,
  regionBase,
  index,
  defaultOpen,
  onImageClick
}: {
  school: { name: string; folder: string; id: number }
  regionKey: RegionKey
  regionBase: string
  index: number
  defaultOpen: boolean
  onImageClick: (img: { src: string; alt: string }) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const colors = regionColors[regionKey]

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          'overflow-hidden rounded-xl bg-white transition-shadow hover:shadow-sm ',
          cn('border border-border border-l-4', colors.border)
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'group flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-muted/40 md:px-5 md:py-3.5 border-b cursor-pointer',
              colors.text,
              open ? colors.border : 'border-transparent'
            )}
          >
            <h3 className="text-sm font-semibold md:text-[15px]">
              <span className="mr-2 text-[10px] opacity-60 md:mr-2.5 md:text-xs">#{index + 1}</span>
              {school.name}
            </h3>
            <div
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full md:size-7',
                'bg-muted/60 transition-colors group-hover:bg-muted'
              )}
            >
              <ChevronDown
                className={cn('size-3.5 transition-transform duration-300 md:size-4', !open && '-rotate-90')}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]">
            <div className="border-b border-border p-3 md:border-b-0 md:border-r md:p-5">
              <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:mb-3 md:text-xs">
                School Count · 学校统计
              </h4>
              <ZoomableImage
                src={`/${regionBase}/${school.folder}/count.png`}
                alt={`${school.name} Count`}
                onClick={onImageClick}
              />
              <p className="mt-1.5 text-[10px] text-muted-foreground md:mt-2 md:text-xs">
                数据来源{' '}
                <a
                  href={`https://education.syncrat.com/education/school/${school.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  education.syncrat.com
                </a>
              </p>
            </div>

            <div className="p-3 md:p-5">
              <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:mb-3 md:text-xs">
                Student Population · 学生人口
              </h4>
              <ZoomableImage
                src={`/${regionBase}/${school.folder}/population.png`}
                alt={`${school.name} Population`}
                onClick={onImageClick}
              />
              <p className="mt-1.5 text-[10px] text-muted-foreground md:mt-2 md:text-xs">
                数据来源{' '}
                <a
                  href={`https://www.educationcounts.govt.nz/find-school/school/population/year?school=${school.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  educationcounts.govt.nz
                </a>
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function ZoomableImage({
  src,
  alt,
  onClick
}: {
  src: string
  alt: string
  onClick: (img: { src: string; alt: string }) => void
}) {
  return (
    <button
      type="button"
      className="group relative block w-full cursor-zoom-in overflow-hidden rounded-md border md:rounded-lg"
      onClick={() => onClick({ src, alt })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full transition-transform duration-200 group-hover:scale-[1.02]"
      />
      <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <ZoomIn className="size-3.5" />
      </span>
    </button>
  )
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-5 md:top-5"
        onClick={onClose}
        aria-label="关闭"
      >
        <X className="size-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
