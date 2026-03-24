const isBrowser = typeof window !== "undefined";

function getStorage(type = "local") {
	if (!isBrowser) {
		return null;
	}

	return type === "session" ? window.sessionStorage : window.localStorage;
}

export function getStorageItem(key, fallback = null, type = "local") {
	if (!isBrowser) {
		return fallback;
	}

	const storage = getStorage(type);
	const rawValue = storage?.getItem(key);

	if (!rawValue) {
		return fallback;
	}

	try {
		return JSON.parse(rawValue);
	} catch {
		return fallback;
	}
}

export function setStorageItem(key, value, type = "local") {
	if (!isBrowser) {
		return;
	}

	const storage = getStorage(type);
	storage?.setItem(key, JSON.stringify(value));
}

export function clearStorageItem(key, type = "local") {
	if (!isBrowser) {
		return;
	}

	const storage = getStorage(type);
	storage?.removeItem(key);
}
