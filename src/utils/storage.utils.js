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