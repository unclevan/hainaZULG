import type { Evidence } from "./brands";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("haina-brand-evidence", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveEvidence(files: File[]): Promise<Evidence[]> {
  if (!files.length) return [];
  const db = await openDatabase();
  const records = files.map(file => ({ id: crypto.randomUUID(), name: file.name }));
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("files", "readwrite");
      const store = transaction.objectStore("files");
      records.forEach((record, index) => store.put(files[index], record.id));
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    return records;
  } finally {
    db.close();
  }
}

export async function downloadEvidence(item: Evidence) {
  const db = await openDatabase();
  try {
    const file = await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db.transaction("files").objectStore("files").get(item.id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (!file) throw new Error("当前浏览器中没有该附件");
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = item.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    db.close();
  }
}

export async function removeEvidence(items: Evidence[]) {
  if (!items.length) return;
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("files", "readwrite");
      const store = transaction.objectStore("files");
      items.forEach(item => store.delete(item.id));
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}
