// utils/periodRange.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

export type Filter = 'day' | 'week' | 'month' | 'year' | undefined;

export function getPeriodRange(
  filter?: Filter,
  tz = 'Asia/Jakarta',
  endTime?: boolean,
) {
  if (!filter) {
    return undefined; // filter kosong => tidak ada range
  }

  const now = dayjs().tz(tz);
  let start: dayjs.Dayjs;

  switch (filter) {
    case 'day':
      start = now.startOf('day');
      break;
    case 'week':
      start = now.startOf('isoWeek');
      break;
    case 'month':
      start = now.startOf('month');
      break;
    case 'year':
      start = now.startOf('year');
      break;
    default:
      return undefined; // fallback
  }

  const endExclusive = endTime ? now.endOf('month') : now.add(1, 'second');

  return {
    gte: start.toDate(),
    lt: endExclusive.toDate(),
  };
}

export function getLabel(percent: number | null): string {
  if (percent == null || percent === 0) return 'Belum ada progress';
  if (percent < 25) return 'Awal yang bagus';
  if (percent < 50) return 'Teruskan';
  if (percent < 75) return 'Mantap';
  if (percent < 100) return 'Hampir sampai';
  return 'Target tercapai 🎉';
}
