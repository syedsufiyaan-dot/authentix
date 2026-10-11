import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { installLocationRuntime } from './services/locationRuntime';
import { installPiAutoStatusRuntime } from './services/piAutoStatusRuntime';
import { isPiAutoMode } from './services/piAutoDiagnosticService';

installLocationRuntime();

// Remember Pi station mode from ?auto=1, but do not start hardware checks on
// the login/dashboard pages. Auto diagnostics begin only after the authenticated
// user opens the diagnostic route.
const piAutoMode = isPiAutoMode();
if (piAutoMode && window.location.pathname.includes('/app/diagnostic')) {
  installPiAutoStatusRuntime();
}

// Camera preview compatibility bridge.
// The diagnostic page mounts its <video> element only after getUserMedia()
// resolves, so the immediate ref assignment can miss the element on some
// browsers. This wrapper waits briefly for the video element to appear and
// then attaches the returned video stream so front/rear previews are visible.
if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
  const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

  navigator.mediaDevices.getUserMedia = async (constraints: MediaStreamConstraints) => {
    const stream = await originalGetUserMedia(constraints);

    if (constraints.video) {
      let attempts = 0;
      const attachVideoStream = () => {
        const video = Array.from(document.querySelectorAll('video')).find(
          (element) => !element.srcObject
        );

        if (video) {
          video.srcObject = stream;
          void video.play().catch(() => {
            // Autoplay can be retried by the browser after the user gesture.
          });
          return;
        }

        attempts += 1;
        if (attempts < 45) {
          requestAnimationFrame(attachVideoStream);
        }
      };

      requestAnimationFrame(attachVideoStream);
    }

    return stream;
  };
}

// Camera capture compatibility bridge.
// The diagnostic component stores a captured data URL, but while the live
// MediaStream remains active its JSX continues to render the <video>. This
// bridge freezes the exact captured frame over the video and adds a Retry
// Photo action for both front and rear camera tests.
if (typeof document !== 'undefined') {
  const captureFrame = (
    video: HTMLVideoElement,
    mirror: boolean
  ): string | null => {
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    if (mirror) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    try {
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch {
      return null;
    }
  };

  const findCameraStep = (button: HTMLButtonElement): HTMLElement | null => {
    let node: HTMLElement | null = button.parentElement;

    while (node) {
      const heading = node.querySelector('h2');
      if (heading?.textContent?.includes('Camera Test')) {
        return node;
      }
      node = node.parentElement;
    }

    return null;
  };

  const showCapturedFrame = (
    button: HTMLButtonElement,
    dataUrl: string,
    mirror: boolean
  ) => {
    window.setTimeout(() => {
      const step = findCameraStep(button);
      const video = step?.querySelector('video') as HTMLVideoElement | null;
      if (!step || !video) return;

      const preview = video.parentElement as HTMLElement | null;
      if (!preview) return;

      preview.querySelectorAll('[data-authentix-camera-capture]').forEach((element) => element.remove());
      step.querySelectorAll('[data-authentix-camera-retry]').forEach((element) => element.remove());

      video.pause();

      const image = document.createElement('img');
      image.src = dataUrl;
      image.alt = mirror ? 'Captured front camera photo' : 'Captured rear camera photo';
      image.dataset.authentixCameraCapture = 'true';
      image.className = 'absolute inset-0 z-10 w-full h-full object-cover';
      preview.appendChild(image);

      const badge = document.createElement('div');
      badge.dataset.authentixCameraCapture = 'true';
      badge.className = 'absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-black/70 text-white text-[11px] font-mono border border-white/20';
      badge.textContent = 'PHOTO CAPTURED';
      preview.appendChild(badge);

      button.style.display = 'none';

      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.dataset.authentixCameraRetry = 'true';
      retryButton.className = 'px-4 py-2 rounded-xl bg-accent-cyan text-bg-darkest font-mono text-xs font-bold hover:bg-accent-cyan/90 transition-all';
      retryButton.textContent = 'Retry Photo';

      retryButton.addEventListener('click', () => {
        preview.querySelectorAll('[data-authentix-camera-capture]').forEach((element) => element.remove());
        retryButton.remove();
        button.style.display = '';
        void video.play().catch(() => {
          // The original camera stream is still active; another user gesture
          // will allow playback if the browser temporarily blocks it.
        });
      });

      button.parentElement?.insertBefore(retryButton, button);
    }, 0);
  };

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button') as HTMLButtonElement | null;
    if (!button || !button.textContent?.includes('Capture Test Photo')) return;

    const step = findCameraStep(button);
    const heading = step?.querySelector('h2')?.textContent || '';
    const video = step?.querySelector('video') as HTMLVideoElement | null;
    if (!video) return;

    const isFrontCamera = heading.includes('Front Camera');

    const attemptCapture = (attempt = 0) => {
      const dataUrl = captureFrame(video, isFrontCamera);

      if (dataUrl) {
        showCapturedFrame(button, dataUrl, isFrontCamera);
        return;
      }

      if (attempt < 12) {
        requestAnimationFrame(() => attemptCapture(attempt + 1));
      }
    };

    attemptCapture();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
