import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Camera preview compatibility bridge.
// The diagnostic page mounts its <video> element only after getUserMedia()
// resolves, so the original immediate ref assignment can miss the element.
// This wrapper waits briefly for the video element to appear and then
// attaches the returned video stream so front/rear previews are visible.
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
            // autoplay may be retried by the browser after the user gesture
          });
          return;
        }

        attempts += 1;
        if (attempts < 30) {
          requestAnimationFrame(attachVideoStream);
        }
      };

      requestAnimationFrame(attachVideoStream);
    }

    return stream;
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
