const isBrowser = typeof window !== "undefined";

export function getStorageItem(key, fallback = null) {
	if (!isBrowser) {
		return fallback;
	}

	const rawValue = window.localStorage.getItem(key);

	if (!rawValue) {
		return fallback;
	}

	try {
		return JSON.parse(rawValue);
	} catch {
		return fallback;
	}
}

export function setStorageItem(key, value) {
	if (!isBrowser) {
		return;
	}

	window.localStorage.setItem(key, JSON.stringify(value));
}

export function clearStorageItem(key) {
	if (!isBrowser) {
		return;
	}

	window.localStorage.removeItem(key);
}
