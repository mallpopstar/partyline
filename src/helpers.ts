export function loadWorker(workerUrl: string, options?: any): Worker {
  const blob = new Blob([`importScripts('${workerUrl}')`], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob), options)
}
