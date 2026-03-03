'use client';

import { useState, useEffect, useCallback } from 'react';

const regions = [
  {
    key: 'ns',
    name: 'North Shore',
    base: 'NorthShore',
    schools: [
      { name: 'Long Bay School', folder: 'LongBaySchool', id: 1342 },
      { name: 'Glamorgan School', folder: 'GlamorganSchool', id: 1283 },
      { name: 'Torbay School', folder: 'TorbaySchool', id: 1538 },
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
    ],
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
      { name: 'Newton Central School', folder: 'NewtonCentralSchool', id: 1392 },
    ],
  },
];

const totalSchools = regions.reduce((sum, r) => sum + r.schools.length, 0);

function SchoolCard({ school, regionKey, regionBase, index }: {
  school: { name: string; folder: string; id: number };
  regionKey: string;
  regionBase: string;
  index: number;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`school-card ${regionKey}`}>
      <div className={`card-header ${regionKey}`} onClick={() => setCollapsed(!collapsed)}>
        <h3><span className="index-num">#{index + 1}</span>{school.name}</h3>
        <span className={`toggle ${collapsed ? 'collapsed' : ''}`}>
          <svg viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" /></svg>
        </span>
      </div>
      <div className={`card-body ${collapsed ? 'collapsed' : ''}`} style={{ maxHeight: collapsed ? 0 : 2000 }}>
        <div className="card-section">
          <h4>School Count · 学校统计</h4>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/${regionBase}/${school.folder}/count.png`} alt={`${school.name} Count`} loading="lazy" />
          <div className="source">
            数据来源 <a href={`https://education.syncrat.com/education/school/${school.id}`} target="_blank" rel="noopener noreferrer">education.syncrat.com</a>
          </div>
        </div>
        <div className="card-section">
          <h4>Student Population · 学生人口</h4>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/${regionBase}/${school.folder}/population.png`} alt={`${school.name} Population`} loading="lazy" />
          <div className="source">
            数据来源 <a href={`https://www.educationcounts.govt.nz/find-school/school/population/year?school=${school.id}`} target="_blank" rel="noopener noreferrer">educationcounts.govt.nz</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('all');
  const [showBackTop, setShowBackTop] = useState(false);
  const [allCollapsed, setAllCollapsed] = useState<boolean | null>(null);
  const [collapseKey, setCollapseKey] = useState(0);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleAll = useCallback((expand: boolean) => {
    setAllCollapsed(!expand);
    setCollapseKey(k => k + 1);
  }, []);

  const filteredRegions = regions
    .filter(r => activeRegion === 'all' || activeRegion === r.key)
    .map(r => ({
      ...r,
      schools: r.schools.filter(s => s.name.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter(r => r.schools.length > 0);

  const shownCount = filteredRegions.reduce((sum, r) => sum + r.schools.length, 0);

  return (
    <>
      <header>
        <h1>Auckland Primary Schools</h1>
        <p>奥克兰小学统计数据与学生人口一览</p>
        <div className="stats-row">
          <div className="stat-item"><div className="stat-num">{totalSchools}</div><div className="stat-label">学校总数</div></div>
          <div className="stat-item"><div className="stat-num">{regions.length}</div><div className="stat-label">覆盖区域</div></div>
        </div>
      </header>

      <div className="toolbar">
        <input type="text" placeholder="搜索学校名称…" value={query} onChange={e => setQuery(e.target.value)} />
        <div className="region-tabs">
          {[{ key: 'all', label: '全部', count: totalSchools }, ...regions.map(r => ({ key: r.key, label: r.name, count: r.schools.length }))].map(tab => (
            <div key={tab.key} className={`region-tab ${activeRegion === tab.key ? 'active' : ''}`} onClick={() => setActiveRegion(tab.key)}>
              {tab.label} <span className="tab-count">{tab.count}</span>
            </div>
          ))}
        </div>
        <span className="count-badge">显示 {shownCount} / {totalSchools}</span>
        <button className="btn" onClick={() => toggleAll(true)}>全部展开</button>
        <button className="btn" onClick={() => toggleAll(false)}>全部折叠</button>
      </div>

      <div className="content">
        {filteredRegions.map(region => (
          <div key={region.key} className="region-section">
            <div className={`region-header ${region.key}`}>
              <h2>{region.name}</h2>
              <span className={`region-badge ${region.key}`}>{region.schools.length} 所学校</span>
            </div>
            <div className="school-list">
              {region.schools.map((s, i) => (
                <SchoolCardControlled
                  key={`${s.folder}-${collapseKey}`}
                  school={s}
                  regionKey={region.key}
                  regionBase={region.base}
                  index={i}
                  forceCollapsed={allCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className={`back-top ${showBackTop ? 'show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
    </>
  );
}

function SchoolCardControlled({ school, regionKey, regionBase, index, forceCollapsed }: {
  school: { name: string; folder: string; id: number };
  regionKey: string;
  regionBase: string;
  index: number;
  forceCollapsed: boolean | null;
}) {
  const [collapsed, setCollapsed] = useState(forceCollapsed ?? false);

  return (
    <div className={`school-card ${regionKey}`}>
      <div className={`card-header ${regionKey}`} onClick={() => setCollapsed(!collapsed)}>
        <h3><span className="index-num">#{index + 1}</span>{school.name}</h3>
        <span className={`toggle ${collapsed ? 'collapsed' : ''}`}>
          <svg viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" /></svg>
        </span>
      </div>
      <div className={`card-body ${collapsed ? 'collapsed' : ''}`} style={{ maxHeight: collapsed ? 0 : 2000 }}>
        <div className="card-section">
          <h4>School Count · 学校统计</h4>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/${regionBase}/${school.folder}/count.png`} alt={`${school.name} Count`} loading="lazy" />
          <div className="source">
            数据来源 <a href={`https://education.syncrat.com/education/school/${school.id}`} target="_blank" rel="noopener noreferrer">education.syncrat.com</a>
          </div>
        </div>
        <div className="card-section">
          <h4>Student Population · 学生人口</h4>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/${regionBase}/${school.folder}/population.png`} alt={`${school.name} Population`} loading="lazy" />
          <div className="source">
            数据来源 <a href={`https://www.educationcounts.govt.nz/find-school/school/population/year?school=${school.id}`} target="_blank" rel="noopener noreferrer">educationcounts.govt.nz</a>
          </div>
        </div>
      </div>
    </div>
  );
}
