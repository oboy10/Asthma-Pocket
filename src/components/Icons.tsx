'use client';

import {
  CgSun,
  CgCloud,
  CgDanger,
  CgSmile,
  CgSmileNeutral,
  CgSmileSad,
  CgSmileNone,
  CgHeart,
  CgNotes,
  CgCalendar,
  CgChart,
  CgOptions,
  CgHome,
  CgGym,
  CgPill,
  CgCheck,
  CgLoadbar,
  CgInfo,
  CgMoon,
  CgTrees,
  CgArrowTopRight,
  CgTrending,
  CgAdd,
} from 'react-icons/cg';

export const Icons = {
  Sun: CgSun,
  Cloud: CgCloud,
  Danger: CgDanger,
  Smile: CgSmile,
  SmileNeutral: CgSmileNeutral,
  SmileSad: CgSmileSad,
  SmileNone: CgSmileNone,
  Heart: CgHeart,
  Notes: CgNotes,
  Calendar: CgCalendar,
  Chart: CgChart,
  Options: CgOptions,
  Home: CgHome,
  Gym: CgGym,
  Pill: CgPill,
  Check: CgCheck,
  Loadbar: CgLoadbar,
  Info: CgInfo,
  Moon: CgMoon,
  Trees: CgTrees,
  ArrowTopRight: CgArrowTopRight,
  Trending: CgTrending,
  Add: CgAdd,
};

export type PlannerIconKey =
  | 'pollen'
  | 'aqi'
  | 'sun'
  | 'lungs'
  | 'streak'
  | 'tip'
  | 'trigger'
  | 'start';

const plannerIconMap: Record<PlannerIconKey, keyof typeof Icons> = {
  pollen: 'Trees',
  aqi: 'Cloud',
  sun: 'Sun',
  lungs: 'Heart',
  streak: 'Trending',
  tip: 'Info',
  trigger: 'Chart',
  start: 'Notes',
};

export function PlannerIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const name = plannerIconMap[iconKey as PlannerIconKey] ?? 'Info';
  const Icon = Icons[name];
  return Icon ? <Icon className={className ?? 'w-6 h-6 text-slate-500'} /> : null;
}
