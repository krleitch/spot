import { UnitSystem } from '@models/userMetadata';

// Common utils across spot-web

/**
 * @param date - string or date object that will be used for the time message
 * @returns string of time with Now/s/m/h/d/y appended
 */
export const getFormattedTime = (date: string | Date): string => {
  const curTime = new Date();
  const messageTime = new Date(date);
  const timeDiff = curTime.getTime() - messageTime.getTime();
  let message = '';
  if (timeDiff < 60000) {
    const secDiff = Math.round(timeDiff / 1000);
    if (secDiff <= 0) {
      message = 'Now';
    } else {
      message = secDiff + 's';
    }
  } else if (timeDiff < 3600000) {
    const minDiff = Math.round(timeDiff / 60000);
    message = minDiff + 'm';
  } else if (timeDiff < 86400000) {
    const hourDiff = Math.round(timeDiff / 3600000);
    message = hourDiff + 'h';
  } else if (timeDiff < 31536000000) {
    const dayDiff = Math.round(timeDiff / 86400000);
    message = dayDiff + 'd';
  } else {
    const yearDiff = Math.round(timeDiff / 31536000000);
    message = yearDiff + 'y';
  }
  return message;
};

/**
 * @param distance - Distance in miles
 * @param unit - Imperal or Metric to convert
 * @returns formatted distance string in metric or imperial
 */
export const getFormattedDistance = (
  distance: number,
  unit: UnitSystem = UnitSystem.IMPERIAL
): string => {
  let distanceString = '';
  if (unit === UnitSystem.METRIC) {
    distanceString += (distance * 1.60934).toFixed(1) + ' km';
  } else {
    distanceString += distance.toFixed(1) + ' m';
  }
  return distanceString;
};
