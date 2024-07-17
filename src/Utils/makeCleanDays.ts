export function currentDayStart() {
  const currentDay = new Date();
  
  currentDay.setHours(0,0,0,0);

  return currentDay;

}

export function nextDayStart() {
  const nextDay = new Date();
  
  nextDay.setHours(0,0,0,0);
  nextDay.setTime(nextDay.getTime() + (24*60*60*1000));

  return nextDay;

}

export function thisWeekStart() {
  const thisWeek = new Date();

  thisWeek.setHours(0,0,0,0);
  thisWeek.setTime(thisWeek.getTime() + (5*(24*60*60*1000)));

  return thisWeek;

  }
