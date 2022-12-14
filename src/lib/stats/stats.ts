import { File } from '../file';
import { Counters, Stats } from './types';


export function percentageToFixed(dividend: number, divisor: number, precision: number = 2): number {
  return parseFloat(((dividend / divisor) * 100).toFixed(precision))
}

export const calcFileStats = (files: File[]): Stats => {
  const total: Counters = {
    files: 0,
    lines: 0,
    percentage: 0.0
  };

  const unloved: Counters = {
    files: 0,
    lines: 0,
    percentage: 0
  };

  const ownerCount = new Map<string, Counters>();

  for (const file of files) {
    total.files++;
    if(typeof file.lines === 'number') total.lines += file.lines;

    if (file.owners.length < 1) {
      unloved.files++;
      if(typeof file.lines === 'number') unloved.lines += file.lines;
    } else {
      for (const owner of file.owners) {
        const counts = ownerCount.get(owner) || { files: 0, lines: 0, percentage: 0 };
        counts.files++;
        if(typeof file.lines === 'number') counts.lines += file.lines;
        ownerCount.set(owner, counts);
      }
    }
  }

  return {
    total: {
      ...total,
      percentage: 100
    },
    unloved: {
      ...unloved,
      percentage: percentageToFixed(unloved.lines, total.lines)
    },
    loved: {
      files: total.files - unloved.files,
      lines: total.lines - unloved.lines,
      percentage: percentageToFixed(total.lines - unloved.lines, total.lines)
    },
    owners: Array.from(ownerCount.keys()).map((owner) => {
      const counts = ownerCount.get(owner);

      return {
        owner,
        counters: {
          files: counts ? counts.files : 0,
          lines: counts ? counts.lines : 0,
          percentage: counts ? percentageToFixed(counts.lines, total.lines) : 0
        },
      };
    }),
  };
};

