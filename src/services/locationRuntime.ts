export interface CapturedGpsLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
}

export const GPS_STORAGE_KEY = 'authentix_last_gps';

function renderLocationCard(location: CapturedGpsLocation): void {
  const heading = Array.from(document.querySelectorAll('h2')).find((element) =>
    /GPS|Location/i.test(element.textContent || '')
  );

  const container = heading?.closest('.space-y-6');
  if (!container) return;

  document.getElementById('authentix-current-location')?.remove();

  const card = document.createElement('div');
  card.id = 'authentix-current-location';
  card.className =
    'p-4 rounded-2xl bg-accent-teal/10 border border-accent-teal/30 space-y-2';

  const title = document.createElement('div');
  title.className = 'text-xs font-mono font-bold text-accent-teal';
  title.textContent = 'CURRENT LOCATION';

  const coordinates = document.createElement('div');
  coordinates.className = 'text-sm font-mono text-white font-bold';
  coordinates.textContent = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;

  const accuracy = document.createElement('div');
  accuracy.className = 'text-xs font-mono text-text-muted';
  accuracy.textContent = `GPS accuracy: ±${Math.round(location.accuracy)} meters`;

  const mapLink = document.createElement('a');
  mapLink.href = `https://www.google.com/maps?q=${encodeURIComponent(
    `${location.latitude},${location.longitude}`
  )}`;
  mapLink.target = '_blank';
  mapLink.rel = 'noopener noreferrer';
  mapLink.className = 'inline-flex text-xs font-mono text-accent-cyan hover:underline';
  mapLink.textContent = 'Open current location in Maps ↗';

  card.append(title, coordinates, accuracy, mapLink);
  container.appendChild(card);
}

function saveLocation(position: GeolocationPosition): CapturedGpsLocation {
  const location: CapturedGpsLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    capturedAt: new Date(position.timestamp || Date.now()).toISOString(),
  };

  try {
    sessionStorage.setItem(GPS_STORAGE_KEY, JSON.stringify(location));
  } catch {
    // The live GPS result should still work when storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent<CapturedGpsLocation>('authentix:gps-location', {
      detail: location,
    })
  );

  renderLocationCard(location);
  return location;
}

let installed = false;

export function installLocationRuntime(): void {
  if (installed || typeof navigator === 'undefined' || !navigator.geolocation) {
    return;
  }

  installed = true;

  const geolocation = navigator.geolocation;
  const originalGetCurrentPosition = geolocation.getCurrentPosition.bind(geolocation);

  const wrappedGetCurrentPosition = (
    success: PositionCallback,
    error?: PositionErrorCallback | null,
    options?: PositionOptions
  ) => {
    originalGetCurrentPosition(
      (position) => {
        saveLocation(position);
        success(position);
      },
      error || undefined,
      options
    );
  };

  // Some Android/Chrome builds expose geolocation methods as non-writable.
  // Never let this optional compatibility hook prevent React from mounting.
  try {
    geolocation.getCurrentPosition = wrappedGetCurrentPosition;
  } catch (error) {
    console.warn('AuthentiX GPS compatibility hook unavailable:', error);
  }

  window.addEventListener('authentix:gps-location', (event) => {
    const customEvent = event as CustomEvent<CapturedGpsLocation>;
    requestAnimationFrame(() => renderLocationCard(customEvent.detail));
    window.setTimeout(() => renderLocationCard(customEvent.detail), 120);
  });
}

export function getLastCapturedLocation(): CapturedGpsLocation | null {
  try {
    const raw = sessionStorage.getItem(GPS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CapturedGpsLocation) : null;
  } catch {
    return null;
  }
}
