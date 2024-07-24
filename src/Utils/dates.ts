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

export function setDate (day:makeTodoDayOptions) {
        
  switch (day) {
    
    case 'tomorrow': {
      return nextDayStart(); 
  
    }

    case 'week': {
      return thisWeekStart();
    }

    default: {
      return currentDayStart();
    }

  };
}

export function setDayFromDateDue(dateDue:Date) {
  const currentDay = currentDayStart();
  const nextDay = nextDayStart();

  if(dateDue.getTime() < currentDay.getTime()) {
    
    return 'overdue'

  } else if(dateDue.getTime() ===  currentDay.getTime()) {
    
    return 'today'   
  
  } else if(dateDue.getTime() === nextDay.getTime()) {
    
    return 'tomorrow'    
  
  } else if(dateDue.getTime() >  nextDay.getTime()) {
    
    return 'week'
  
  } else {
    return 'complete';
  }
   
}