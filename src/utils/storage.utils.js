import { fromEvent, combineLatest, BehaviorSubject } from 'rxjs';
function safeJsonStringify(data) {
  return JSON.stringify(data);
}

function safeJsonParse(text) {
  return JSON.parse(text);
}

export function set(key, value) {
  return new Promise((resolve) => {
    if (typeof localStorage !== 'undefined')
      localStorage?.setItem(key, safeJsonStringify(value));
    resolve()
  })
}
export function del(key){
  return new Promise((resolve) => {
    if (typeof localStorage !== 'undefined')
      localStorage?.removeItem(key);
    resolve();
  })
}

export function get(key, defaultValue){
  return new Promise((resolve) => {
    const value = (typeof localStorage !== 'undefined') ? localStorage.getItem(key) : null;
    if (value == null) return resolve(defaultValue);
    resolve(safeJsonParse(value))
  });
}

export function localStorageSubject(code, defaultValue, converter){
  return persistentSubject(localStorage, code, defaultValue, converter)
}
export function persistentSubject(storage, code, defaultValue, converter){
  const persistedValue = storage.getItem(code);
  let initValue;
  if (persistedValue !=null){
    initValue = converter.from(persistedValue)
  }
  if (initValue === undefined){
    initValue = defaultValue
  }
  const obs$ =  new BehaviorSubject(initValue);
  obs$.subscribe(newValue => {
    if (newValue == null){
      storage.removeItem(code)
    }
    else {
      storage.setItem(code, converter.to(newValue))
    }
  })
  return obs$;
}