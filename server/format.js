export function formatLocalISO(date = new Date()) {
        // components
        const pad = (n) => String(n).padStart(2, '0');
        const YYYY = date.getFullYear();
        const MM   = pad(date.getMonth() + 1);
        const DD   = pad(date.getDate());
        const hh   = pad(date.getHours());
        const mm   = pad(date.getMinutes());
        const ss   = pad(date.getSeconds());
        
        // timezone offset in minutes, convert to +-hh:mm or -hh:mm
        const offsetMin = -date.getTimezoneOffset(); 
        const sign = offsetMin >= 0 ? '+' : '-';
        const absOff = Math.abs(offsetMin);
        const offH = pad(Math.floor(absOff / 60));
        const offM = pad(absOff % 60);
      
        return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}${sign}${offH}:${offM}`;
      }

export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toCamelCase(object) {
  //converts object keys to camel case
  if (Array.isArray(object)) {
    return object.map((v) => toCamelCase(v));
  } else if (object !== null && object.constructor === Object) {
    return Object.entries(object).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(value); // recursively convert nested objects/arrays
      return acc;
    }, {});
  }
  return object;
}


// Snake case conversion utility
export function toSnakeCase(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    let processedValue = value;
    
    if (typeof value === 'object' && value !== null) {
      processedValue = Array.isArray(value) 
        ? value.map(item => toSnakeCase(item)) 
        : toSnakeCase(value);
    }
    
    return { ...acc, [snakeKey]: processedValue };
  }, {});
}

