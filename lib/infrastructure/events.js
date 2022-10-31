class Events {
  opts=null
  command=null
  config=null
  listeners=new Map()

  constructor() {
    this.listeners.set('beforeCommit', [])
    this.listeners.set('afterCommit', [])
    this.listeners.set('beforePush', [])
    this.listeners.set('afterPush', [])
  }

  on(name, fn) {
    if (!this.listeners.has(name)) {
      return false;
    }

    this.listeners.set(name, this.listeners.get(name).concat(fn))

    return true;
  }

  async emit(name) {
    if (!this.listeners.has(name)) {
      return [];
    }

    const arr = this.listeners.get(name)
    if (arr.length === 0) {
      return []
    }

    const jobs = arr.map(async fn => await fn.apply(this))

    return Promise.all(jobs)
  }
}

export default new Events()