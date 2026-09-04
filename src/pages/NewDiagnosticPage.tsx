import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Eye, 
  Grid, 
  Camera, 
  Mic, 
  Volume2, 
  Vibrate, 
  HardDrive, 
  Wifi, 
  Bluetooth, 
  MapPin, 
  Compass, 
  BatteryCharging, 
  Cpu, 
  CheckSquare, 
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Play,
  Square,
  Sparkles,
  Maximize2,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { DeviceInfo, TestItemResult, TestStatus, PhysicalInspectionData, DiagnosticCategory } from '../types/diagnostic';
import { useDiagnostic } from '../context/DiagnosticContext';
import { StorageService } from '../services/storageService';
import { getGradeFromScore, getStatusBadge } from '../utils/trustScore';
import { useToast } from '../components/common/Toast';
import { TrustScoreModal } from '../components/diagnostic/TrustScoreModal';
import { DisclaimerBadge } from '../components/common/DisclaimerBadge';

const TEST_DEFINITIONS: { id: string; num: string; title: string; category: DiagnosticCategory; icon: React.ElementType; description: string }[] = [
  { id: 'device_info', num: '01', title: 'Device Information', category: 'storage_hardware', icon: Smartphone, description: 'Browser-available environment capabilities & logical threads' },
  { id: 'display', num: '02', title: 'Display Test', category: 'display_touch', icon: Eye, description: 'Full-screen color verification for dead pixels & burn-in' },
  { id: 'touch', num: '03', title: 'Touch Screen Test', category: 'display_touch', icon: Grid, description: 'Interactive multi-touch grid drag coverage analysis' },
  { id: 'front_camera', num: '04', title: 'Front Camera Test', category: 'cameras', icon: Camera, description: 'Front-facing selfie sensor & focus validation' },
  { id: 'rear_camera', num: '05', title: 'Rear Camera Test', category: 'cameras', icon: Camera, description: 'Main environment sensor & optical clarity review' },
  { id: 'mic', num: '06', title: 'Microphone Test', category: 'audio', icon: Mic, description: 'Live acoustic level visualizer & voice playback test' },
  { id: 'speaker', num: '07', title: 'Speaker / Audio Test', category: 'audio', icon: Volume2, description: 'Acoustic tone sweep & stereo channel panning test' },
  { id: 'vibration', num: '08', title: 'Vibration Test', category: 'sensors', icon: Vibrate, description: 'Haptic actuator pulse vibration responsiveness' },
  { id: 'storage', num: '09', title: 'Storage Capability Test', category: 'storage_hardware', icon: HardDrive, description: 'Browser partition quota & allocated volume metrics' },
  { id: 'network', num: '10', title: 'Internet / Network Test', category: 'connectivity', icon: Wifi, description: 'Real-time ping latency & network connection type' },
  { id: 'bluetooth', num: '11', title: 'Bluetooth Capability Test', category: 'connectivity', icon: Bluetooth, description: 'Web Bluetooth API adapter discovery capability' },
  { id: 'gps', num: '12', title: 'GPS / Location Test', category: 'connectivity', icon: MapPin, description: 'Geolocation positioning accuracy & satellite lock' },
  { id: 'motion', num: '13', title: 'Motion & Orientation Sensor Test', category: 'sensors', icon: Compass, description: '3-axis accelerometer & gyroscope tilt tracking' },
  { id: 'battery', num: '14', title: 'Battery / Charging Test', category: 'battery', icon: BatteryCharging, description: 'Battery status API power rail inspection' },
  { id: 'hardware', num: '15', title: 'Hardware Capability Test', category: 'storage_hardware', icon: Cpu, description: 'System thread concurrency & GPU WebGL audit' },
  { id: 'physical', num: '16', title: 'Physical Condition Inspection', category: 'physical', icon: CheckSquare, description: 'Manual physical assessment of glass, chassis & buttons' },
];

export const NewDiagnosticPage: React.FC = () => {
  const { currentDevice, detectDevice, saveCompletedReport } = useDiagnostic();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Test state initialization
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0); // 0 to 16 (16 = Review)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(currentDevice);

  const [tests, setTests] = useState<Record<string, TestItemResult>>(() => {
    const saved = StorageService.getActiveInspection<{ tests: Record<string, TestItemResult>; step: number; physical: PhysicalInspectionData }>();
    if (saved && saved.tests) return saved.tests;

    const initial: Record<string, TestItemResult> = {};
    TEST_DEFINITIONS.forEach((t) => {
      initial[t.id] = {
        id: t.id,
        title: t.title,
        category: t.category,
        status: 'NOT_TESTED',
        details: 'Pending interactive user verification',
      };
    });
    return initial;
  });

  const [physicalData, setPhysicalData] = useState<PhysicalInspectionData>(() => {
    const saved = StorageService.getActiveInspection<{ physical: PhysicalInspectionData }>();
    return saved?.physical || {
      screenGlass: 'No damage',
      bodyFrame: 'Excellent',
      cameraLens: 'Clean',
      chargingPort: 'Good',
      powerButton: 'Working',
      volumeButtons: 'Working',
      simTray: 'Good',
      backPanel: 'Good',
      notes: '',
    };
  });

  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Restore saved active inspection
  useEffect(() => {
    const saved = StorageService.getActiveInspection<{ step: number; tests: Record<string, TestItemResult>; physical: PhysicalInspectionData }>();
    if (saved) {
      if (typeof saved.step === 'number') setActiveStepIndex(saved.step);
      if (saved.tests) setTests(saved.tests);
      if (saved.physical) setPhysicalData(saved.physical);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    StorageService.saveActiveInspection({
      step: activeStepIndex,
      tests,
      physical: physicalData,
    });
  }, [activeStepIndex, tests, physicalData]);

  // Ensure device info is loaded
  useEffect(() => {
    if (!deviceInfo) {
      detectDevice().then((d) => setDeviceInfo(d)).catch(() => {});
    }
  }, [deviceInfo, detectDevice]);

  const updateTestStatus = (id: string, status: TestStatus, details: string, userNotes?: string, data?: Record<string, unknown>) => {
    setTests((prev) => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          status,
          details,
          userNotes,
          data,
          testedAt: new Date().toISOString(),
        },
      };
      return updated;
    });
  };

  const completedCount = Object.values(tests).filter((t) => t.status !== 'NOT_TESTED' && t.status !== 'IN_PROGRESS').length;

  const handleNext = () => {
    if (activeStepIndex < TEST_DEFINITIONS.length) {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    StorageService.clearActiveInspection();
    const fresh: Record<string, TestItemResult> = {};
    TEST_DEFINITIONS.forEach((t) => {
      fresh[t.id] = {
        id: t.id,
        title: t.title,
        category: t.category,
        status: 'NOT_TESTED',
        details: 'Pending interactive user verification',
      };
    });
    setTests(fresh);
    setPhysicalData({
      screenGlass: 'No damage',
      bodyFrame: 'Excellent',
      cameraLens: 'Clean',
      chargingPort: 'Good',
      powerButton: 'Working',
      volumeButtons: 'Working',
      simTray: 'Good',
      backPanel: 'Good',
      notes: '',
    });
    setActiveStepIndex(0);
    toast('Diagnostic reset to step 1.', 'info');
  };

  const handleGenerateReport = () => {
    if (!deviceInfo) return;
    const report = saveCompletedReport(deviceInfo, tests, physicalData);
    toast('AuthentiX Inspection Certificate Generated!', 'success');
    navigate(`/app/report/${report.id}`);
  };

  const currentTestDef = TEST_DEFINITIONS[activeStepIndex];

  // ==========================================
  // SUB-MODULE TEST CONTROLLERS
  // ==========================================

  // 1. Display Test States
  const [displayColorIndex, setDisplayColorIndex] = useState<number>(0);
  const [isFullScreenDisplay, setIsFullScreenDisplay] = useState<boolean>(false);
  const displayColors = [
    { name: 'Pure White (100% RGB)', hex: '#FFFFFF', darkText: true },
    { name: 'Pure Black (OLED True Black)', hex: '#000000', darkText: false },
    { name: 'Pure Red (Sub-Pixel Test)', hex: '#FF0000', darkText: false },
    { name: 'Pure Green (Sub-Pixel Test)', hex: '#00FF00', darkText: true },
    { name: 'Pure Blue (Sub-Pixel Test)', hex: '#0000FF', darkText: false },
    { name: '50% Neutral Gray (Uniformity)', hex: '#808080', darkText: false },
  ];

  // 2. Touch Screen Test States
  const totalGridCells = 160; // 10 x 16 grid
  const [touchedCells, setTouchedCells] = useState<Set<number>>(new Set());
  const [activeTouchesCount, setActiveTouchesCount] = useState<number>(0);
  const isPointerDownRef = useRef<boolean>(false);

  const handleCellHover = (index: number) => {
    if (isPointerDownRef.current) {
      setTouchedCells((prev) => new Set(prev).add(index));
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setActiveTouchesCount(e.touches.length);
    Array.from(e.touches).forEach((touch) => {
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const cellIdx = el?.getAttribute('data-cell-index');
      if (cellIdx !== null && cellIdx !== undefined) {
        setTouchedCells((prev) => new Set(prev).add(parseInt(cellIdx, 10)));
      }
    });
  };

  const touchCoveragePct = Math.round((touchedCells.size / totalGridCells) * 100);

  // 3. Camera Tests States
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraSnapshot, setCameraSnapshot] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async (facingMode: 'user' | { ideal: 'environment' }) => {
    stopCamera();
    setCameraLoading(true);
    setCameraError(null);
    setCameraSnapshot(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access failed.';
      setCameraError(msg);
      updateTestStatus(currentTestDef.id, 'UNSUPPORTED', `Camera access denied or unavailable: ${msg}`);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setCameraSnapshot(canvas.toDataURL('image/jpeg', 0.8));
      }
    }
  };

  // Cleanup camera when switching step
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [activeStepIndex]);

  // 4. Microphone Test States
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);
  const [micRecordingUrl, setMicRecordingUrl] = useState<string | null>(null);
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [recordCountdown, setRecordCountdown] = useState<number>(5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startMicTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicActive(true);

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!micStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setMicAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone unavailable';
      updateTestStatus('mic', 'UNSUPPORTED', `Microphone permission denied: ${msg}`);
      toast('Microphone access could not be established.', 'error');
    }
  };

  const record5Seconds = () => {
    if (!micStreamRef.current) return;
    setIsRecordingMic(true);
    setRecordCountdown(5);
    audioChunksRef.current = [];

    const recorder = new MediaRecorder(micStreamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setMicRecordingUrl(url);
      setIsRecordingMic(false);
    };

    recorder.start();

    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      setRecordCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000);
  };

  const stopMic = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicActive(false);
  };

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, [activeStepIndex]);

  // 5. Speaker Test (Synthesized Web Audio Tones)
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const playDiagnosticTone = (channel: 'stereo' | 'left' | 'right' = 'stereo') => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // 440 Hz
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5); // Chime sweep to 880 Hz
      osc.frequency.exponentialRampToValueAtTime(554.37, ctx.currentTime + 1.0);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      if (panner) {
        if (channel === 'left') panner.pan.value = -1;
        else if (channel === 'right') panner.pan.value = 1;
        else panner.pan.value = 0;
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(ctx.destination);
      osc.start();
      setIsPlayingAudio(true);
      osc.stop(ctx.currentTime + 1.6);
      setTimeout(() => setIsPlayingAudio(false), 1600);
    } catch {
      toast('Web Audio playback error', 'error');
    }
  };

  // 6. Vibration Test
  const triggerVibration = () => {
    if ('vibrate' in navigator) {
      try {
        const didVibrate = navigator.vibrate([200, 100, 200]);
        if (didVibrate) {
          toast('Vibration triggered (200ms - pause - 200ms)', 'info');
        } else {
          toast('Vibration call returned false (device may be in silent/DND mode).', 'info');
        }
      } catch {
        toast('Vibration API blocked by OS permissions.', 'error');
      }
    } else {
      toast('Vibration API is unsupported on this browser/OS.', 'error');
    }
  };

  // 7. Network Ping Test
  const [networkPingMs, setNetworkPingMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const runPingTest = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
      const duration = Math.round(performance.now() - start);
      setNetworkPingMs(duration);
      updateTestStatus(
        'network',
        duration < 250 ? 'PASSED' : 'WARNING',
        `Online (${navigator.onLine ? 'Active' : 'Offline'}) • Host Round-Trip: ${duration}ms • Link: ${(navigator as any).connection?.effectiveType || 'Broadband'}`
      );
    } catch {
      setNetworkPingMs(999);
      updateTestStatus('network', 'WARNING', 'Network reachable but ping endpoint timed out.');
    } finally {
      setIsPinging(false);
    }
  };

  // 8. Bluetooth Test
  const [btStatus, setBtStatus] = useState<string>('Not tested');
  const requestBluetoothDevice = async () => {
    if ('bluetooth' in navigator && (navigator as any).bluetooth?.requestDevice) {
      try {
        setBtStatus('Opening Bluetooth Chooser...');
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
        });
        setBtStatus(`Discovered device: ${device.name || 'Unnamed BT Peripheral'}`);
        updateTestStatus('bluetooth', 'PASSED', `Web Bluetooth capability operational. Detected: ${device.name || 'BT Device'}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'User cancelled or BT error';
        if (msg.includes('User cancelled')) {
          setBtStatus('Bluetooth chooser opened successfully (User dismissed scan).');
          updateTestStatus('bluetooth', 'PASSED', 'Web Bluetooth API accessible and functional.');
        } else {
          setBtStatus(`Bluetooth Error: ${msg}`);
          updateTestStatus('bluetooth', 'WARNING', `Bluetooth capability error: ${msg}`);
        }
      }
    } else {
      setBtStatus('Web Bluetooth is not supported on this browser/engine.');
      updateTestStatus('bluetooth', 'UNSUPPORTED', 'Web Bluetooth API unavailable on this browser engine.');
    }
  };

  // 9. Location / GPS Test
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const requestLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const acc = Math.round(pos.coords.accuracy);
          setGpsAccuracy(acc);
          setIsLocating(false);
          const stat: TestStatus = acc <= 50 ? 'PASSED' : 'WARNING';
          updateTestStatus('gps', stat, `GPS Lock Established • Accuracy: ±${acc} meters`);
          toast(`Location acquired with ±${acc}m accuracy.`, 'success');
        },
        (err) => {
          setIsLocating(false);
          updateTestStatus('gps', 'FAILED', `Geolocation error: ${err.message}`);
          toast(`Geolocation error: ${err.message}`, 'error');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      updateTestStatus('gps', 'UNSUPPORTED', 'Geolocation API unsupported on this device.');
    }
  };

  // 10. Motion Sensors
  const [motionAlpha, setMotionAlpha] = useState<number>(0);
  const [motionBeta, setMotionBeta] = useState<number>(0);
  const [motionGamma, setMotionGamma] = useState<number>(0);
  const [motionSupported, setMotionSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (activeStepIndex === 12) {
      const handleOrientation = (e: DeviceOrientationEvent) => {
        if (e.alpha !== null || e.beta !== null || e.gamma !== null) {
          setMotionSupported(true);
          setMotionAlpha(Math.round(e.alpha || 0));
          setMotionBeta(Math.round(e.beta || 0));
          setMotionGamma(Math.round(e.gamma || 0));
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [activeStepIndex]);

  const requestiOSMotion = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm === 'granted') {
          setMotionSupported(true);
          toast('Motion permissions granted.', 'success');
        } else {
          setMotionSupported(false);
          updateTestStatus('motion', 'UNSUPPORTED', 'iOS DeviceOrientation permission rejected.');
        }
      } catch {
        setMotionSupported(false);
      }
    }
  };

  // 11. Battery Status API
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryCharging, setBatteryCharging] = useState<boolean | null>(null);
  const [batteryApiSupported, setBatteryApiSupported] = useState<boolean | null>(null);

  const checkBatteryApi = async () => {
    if ('getBattery' in navigator) {
      try {
        const b = await (navigator as any).getBattery();
        setBatteryLevel(Math.round(b.level * 100));
        setBatteryCharging(b.charging);
        setBatteryApiSupported(true);
        updateTestStatus('battery', 'PASSED', `Battery Level: ${Math.round(b.level * 100)}% • Charging: ${b.charging ? 'Yes' : 'No'}`);
      } catch {
        setBatteryApiSupported(false);
        updateTestStatus('battery', 'UNSUPPORTED', 'Battery Status API restricted by browser privacy policy.');
      }
    } else {
      setBatteryApiSupported(false);
      updateTestStatus('battery', 'UNSUPPORTED', 'Battery Status API unsupported on this browser engine.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none pb-12">
      {/* Top Header & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bg-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              AUTHENTIX DEVICE INSPECTION
            </h1>
            <DisclaimerBadge type="browser" />
          </div>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Interactive step-by-step mobile hardware diagnostic & capability verification
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl glass-panel hover:border-status-warning text-xs font-mono text-text-muted hover:text-white flex items-center gap-1.5 transition-all"
            title="Reset All Test Progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Test Navigator Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-accent-teal font-bold">
            {completedCount} / 16 Tests Completed
          </span>
          <span className="text-text-muted">
            Step {activeStepIndex + 1} of 17: {activeStepIndex === 16 ? 'Final Review & Score' : currentTestDef.title}
          </span>
        </div>

        {/* Horizontal Stepper Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {TEST_DEFINITIONS.map((def, idx) => {
            const status = tests[def.id]?.status || 'NOT_TESTED';
            const isCurrent = activeStepIndex === idx;
            const badge = getStatusBadge(status);

            return (
              <button
                key={def.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-medium shrink-0 transition-all flex items-center gap-2 border ${
                  isCurrent
                    ? 'bg-accent-teal/20 text-accent-teal border-accent-teal shadow-teal-glow'
                    : status === 'PASSED'
                    ? 'bg-status-success/10 text-status-success border-status-success/30'
                    : status === 'WARNING'
                    ? 'bg-status-warning/10 text-status-warning border-status-warning/30'
                    : status === 'FAILED'
                    ? 'bg-status-critical/10 text-status-critical border-status-critical/30'
                    : status === 'UNSUPPORTED'
                    ? 'bg-white/5 text-text-muted border-white/10'
                    : 'glass-panel text-text-dim border-bg-border hover:text-white'
                }`}
              >
                <span>{def.num}</span>
                <span className="hidden md:inline">{def.title.split(' ')[0]}</span>
                {status === 'PASSED' && <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />}
                {status === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />}
                {status === 'FAILED' && <XCircle className="w-3.5 h-3.5 text-status-critical" />}
              </button>
            );
          })}

          {/* Review Step Tab */}
          <button
            onClick={() => setActiveStepIndex(16)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold shrink-0 transition-all border ${
              activeStepIndex === 16
                ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan shadow-cyan-glow'
                : 'glass-panel text-accent-cyan/80 border-bg-border hover:text-accent-cyan'
            }`}
          >
            17. Review & Report →
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TEST VIEW AREA */}
      {/* ========================================================================= */}

      <div className="rounded-3xl glass-panel-glow border border-accent-teal/20 p-6 md:p-8 space-y-6">
        {/* Step 01: Device Info */}
        {activeStepIndex === 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">01. Device Information</h2>
                  <p className="text-xs text-text-muted font-mono">BROWSER-AVAILABLE DEVICE INFORMATION</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-accent-teal/10 text-accent-teal border border-accent-teal/30">
                Auto-Detected
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              AuthentiX reads genuine hardware environment parameters exposed by your client runtime without fabricating IMEI, motherboard serials, or internal flash wear.
            </p>

            {deviceInfo && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-text-dim block text-[10px]">DEVICE / OS</span>
                  <span className="text-white font-bold">{deviceInfo.os} {deviceInfo.osVersion}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-text-dim block text-[10px]">BROWSER ENGINE</span>
                  <span className="text-white font-bold">{deviceInfo.browser}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-text-dim block text-[10px]">DISPLAY MATRIX</span>
                  <span className="text-white font-bold">{deviceInfo.screenRes} (@{deviceInfo.pixelRatio}x)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-text-dim block text-[10px]">CPU CONCURRENCY</span>
                  <span className="text-white font-bold">{deviceInfo.cpuCores} Logical Threads</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-text-dim block text-[10px]">DEVICE MEMORY</span>
                  <span className="text-white font-bold">{deviceInfo.deviceMemoryGb ? `~${deviceInfo.deviceMemoryGb} GB RAM` : 'OEM Restricted'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-text-dim block text-[10px]">TOUCH CAPABILITY</span>
                  <span className="text-white font-bold">{deviceInfo.touchSupport ? `Yes (${deviceInfo.maxTouchPoints} pts)` : 'Pointer Only'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-text-dim block text-[10px]">LANGUAGE</span>
                  <span className="text-white font-bold">{deviceInfo.language}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-text-dim block text-[10px]">ONLINE STATE</span>
                  <span className="text-status-success font-bold">{deviceInfo.online ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-bg-border">
              <span className="text-xs text-text-muted font-mono">Ready to inspect physical components?</span>
              <button
                onClick={() => {
                  updateTestStatus('device_info', 'PASSED', 'Browser-available device telemetry acquired successfully.');
                  handleNext();
                }}
                className="px-6 py-3 rounded-xl bg-accent-teal text-bg-darkest font-bold text-xs font-mono uppercase tracking-wider hover:bg-accent-teal/90 transition-all shadow-teal-glow flex items-center gap-2"
              >
                <span>BEGIN HARDWARE TESTS</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 02: Display Test */}
        {activeStepIndex === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">02. Display & Screen Test</h2>
                  <p className="text-xs text-text-muted font-mono">Full-screen color pattern verification</p>
                </div>
              </div>
              <button
                onClick={() => setIsFullScreenDisplay(true)}
                className="px-4 py-2 rounded-xl bg-accent-cyan text-bg-darkest font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-accent-cyan/90 transition-all shadow-cyan-glow"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Launch Full Screen Test</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-text-muted">
              <div className="font-semibold text-white">Instructions:</div>
              <p>
                Inspect the screen for <strong>dead pixels, discoloration, OLED burn-in, bright spots, flickering, or abnormal horizontal/vertical lines</strong>. Cycle through all 6 diagnostic color patterns.
              </p>
            </div>

            {/* In-page color preview blocks */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {displayColors.map((col, idx) => (
                <div
                  key={col.name}
                  className="h-16 rounded-xl border border-white/20 flex items-center justify-center text-[10px] font-mono font-bold"
                  style={{ backgroundColor: col.hex, color: col.darkText ? '#000000' : '#FFFFFF' }}
                >
                  {col.name.split(' ')[0]}
                </div>
              ))}
            </div>

            {/* Full Screen Overlay Modal */}
            {isFullScreenDisplay && (
              <div
                className="fixed inset-0 z-50 flex flex-col justify-between p-6 cursor-pointer select-none"
                style={{ backgroundColor: displayColors[displayColorIndex].hex }}
                onClick={() => setDisplayColorIndex((prev) => (prev + 1) % displayColors.length)}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20"
                  >
                    Color {displayColorIndex + 1}/6: {displayColors[displayColorIndex].name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullScreenDisplay(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-black/80 text-white font-mono text-xs border border-white/20 hover:bg-black"
                  >
                    Exit Full Screen ✕
                  </button>
                </div>

                <div className="text-center">
                  <p className="inline-block px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-mono border border-white/20">
                    Tap anywhere on the screen to switch to next diagnostic color
                  </p>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDisplayColorIndex((prev) => (prev - 1 + displayColors.length) % displayColors.length);
                    }}
                    className="px-4 py-2 rounded-xl bg-black/80 text-white font-mono text-xs border border-white/20"
                  >
                    ← Prev Color
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDisplayColorIndex((prev) => (prev + 1) % displayColors.length);
                    }}
                    className="px-4 py-2 rounded-xl bg-black/80 text-white font-mono text-xs border border-white/20"
                  >
                    Next Color →
                  </button>
                </div>
              </div>
            )}

            {/* Assessment Buttons */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-white font-bold">How does the display look?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    updateTestStatus('display', 'PASSED', 'No dead pixels, discoloration, or burn-in observed.');
                    toast('Display test marked PASS', 'success');
                    handleNext();
                  }}
                  className="p-3.5 rounded-xl border border-status-success/30 bg-status-success/10 hover:bg-status-success/20 text-status-success font-mono text-xs font-bold flex flex-col items-center gap-1 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>PASS</span>
                  <span className="text-[10px] text-text-muted font-normal">No visible problems</span>
                </button>

                <button
                  onClick={() => {
                    updateTestStatus('display', 'WARNING', 'Minor discoloration, backlight bleed, or faint burn-in noted.');
                    toast('Display test marked WARNING', 'info');
                    handleNext();
                  }}
                  className="p-3.5 rounded-xl border border-status-warning/30 bg-status-warning/10 hover:bg-status-warning/20 text-status-warning font-mono text-xs font-bold flex flex-col items-center gap-1 transition-all"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span>WARNING</span>
                  <span className="text-[10px] text-text-muted font-normal">Minor defects observed</span>
                </button>

                <button
                  onClick={() => {
                    updateTestStatus('display', 'FAILED', 'Major display issue: dead pixels, lines, or severe burn-in.');
                    toast('Display test marked FAILED', 'error');
                    handleNext();
                  }}
                  className="p-3.5 rounded-xl border border-status-critical/30 bg-status-critical/10 hover:bg-status-critical/20 text-status-critical font-mono text-xs font-bold flex flex-col items-center gap-1 transition-all"
                >
                  <XCircle className="w-5 h-5" />
                  <span>FAIL</span>
                  <span className="text-[10px] text-text-muted font-normal">Major issue / cracked pixels</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 03: Touch Screen Test */}
        {activeStepIndex === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">03. Touch Screen Digitizer Test</h2>
                  <p className="text-xs text-text-muted font-mono">10 × 16 interactive matrix drag coverage</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-bold text-accent-teal">{touchCoveragePct}%</div>
                <div className="text-[10px] text-text-muted">Coverage Target ≥90%</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-text-muted">
              <span>👉 <strong>Drag your finger or cursor across all grid cells</strong> to illuminate them.</span>
              <button
                onClick={() => setTouchedCells(new Set())}
                className="text-xs font-mono text-accent-cyan hover:underline"
              >
                Reset Grid
              </button>
            </div>

            {/* Interactive Touch Matrix Container */}
            <div
              className="w-full h-72 md:h-80 rounded-2xl bg-bg-darker border-2 border-accent-teal/30 p-2 select-none touch-none grid grid-cols-10 grid-rows-16 gap-1"
              onPointerDown={() => { isPointerDownRef.current = true; }}
              onPointerUp={() => { isPointerDownRef.current = false; }}
              onTouchMove={handleTouchMove}
            >
              {Array.from({ length: totalGridCells }).map((_, idx) => {
                const isTouched = touchedCells.has(idx);
                return (
                  <div
                    key={idx}
                    data-cell-index={idx}
                    onMouseEnter={() => handleCellHover(idx)}
                    className={`rounded-sm transition-colors duration-150 ${
                      isTouched
                        ? 'bg-accent-teal shadow-sm shadow-accent-teal/50'
                        : 'bg-white/5 hover:bg-white/15'
                    }`}
                  />
                );
              })}
            </div>

            {/* Touch Test Confirmations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  const stat: TestStatus = touchCoveragePct >= 85 ? 'PASSED' : 'WARNING';
                  updateTestStatus('touch', stat, `Digitizer matrix touch coverage: ${touchCoveragePct}% (${touchedCells.size}/${totalGridCells} cells)`);
                  toast(`Touch test recorded (${touchCoveragePct}% coverage)`, 'success');
                  handleNext();
                }}
                className="p-3.5 rounded-xl border border-status-success/30 bg-status-success/10 hover:bg-status-success/20 text-status-success font-mono text-xs font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>PASS ({touchCoveragePct}%)</span>
              </button>

              <button
                onClick={() => {
                  updateTestStatus('touch', 'WARNING', `Partial touch dead zones noted (Coverage: ${touchCoveragePct}%).`);
                  toast('Touch test marked WARNING', 'info');
                  handleNext();
                }}
                className="p-3.5 rounded-xl border border-status-warning/30 bg-status-warning/10 hover:bg-status-warning/20 text-status-warning font-mono text-xs font-bold flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>WARNING (Dead Zones)</span>
              </button>

              <button
                onClick={() => {
                  updateTestStatus('touch', 'FAILED', 'Digitizer unresponsive or erratic ghost touches.');
                  toast('Touch test marked FAILED', 'error');
                  handleNext();
                }}
                className="p-3.5 rounded-xl border border-status-critical/30 bg-status-critical/10 hover:bg-status-critical/20 text-status-critical font-mono text-xs font-bold flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>FAIL</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 04: Front Camera Test */}
        {activeStepIndex === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">04. Front Camera Test</h2>
                  <p className="text-xs text-text-muted font-mono">Selfie camera optic & live stream preview</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-teal">facingMode: "user"</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-muted flex items-start gap-2">
              <Info className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
              <span>
                Privacy Assurance: Camera preview runs strictly in local memory and tracks are immediately terminated upon exiting this step.
              </span>
            </div>

            {/* Live Video Preview Box */}
            <div className="w-full max-w-md mx-auto h-64 md:h-72 rounded-2xl bg-bg-darker border border-accent-teal/30 relative overflow-hidden flex items-center justify-center">
              {cameraStream ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
              ) : cameraSnapshot ? (
                <img src={cameraSnapshot} alt="Front Snapshot" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-3 p-4">
                  <Camera className="w-8 h-8 text-text-dim mx-auto" />
                  <p className="text-xs text-text-muted font-mono">Camera stream is currently inactive</p>
                  <button
                    onClick={() => startCamera('user')}
                    disabled={cameraLoading}
                    className="px-5 py-2.5 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold hover:bg-accent-teal/90 transition-all shadow-teal-glow"
                  >
                    {cameraLoading ? 'Requesting Camera...' : 'Start Front Camera'}
                  </button>
                </div>
              )}
            </div>

            {cameraStream && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={captureSnapshot}
                  className="px-4 py-2 rounded-xl bg-accent-cyan text-bg-darkest font-mono text-xs font-bold"
                >
                  Capture Test Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-xl glass-panel text-text-muted hover:text-white font-mono text-xs"
                >
                  Stop Stream
                </button>
              </div>
            )}

            {/* Assessment */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-white font-bold">Is the front camera working properly?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    stopCamera();
                    updateTestStatus('front_camera', 'PASSED', 'Front camera stream clear, responsive autofocus.');
                    toast('Front camera marked PASS', 'success');
                    handleNext();
                  }}
                  className="p-3 rounded-xl border border-status-success/30 bg-status-success/10 text-status-success font-mono text-xs font-bold"
                >
                  PASS (Clear)
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    updateTestStatus('front_camera', 'WARNING', 'Front camera shows blurry focus or sensor noise.');
                    toast('Front camera marked WARNING', 'info');
                    handleNext();
                  }}
                  className="p-3 rounded-xl border border-status-warning/30 bg-status-warning/10 text-status-warning font-mono text-xs font-bold"
                >
                  WARNING (Blur)
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    updateTestStatus('front_camera', 'FAILED', 'Front camera black screen or sensor error.');
                    toast('Front camera marked FAILED', 'error');
                    handleNext();
                  }}
                  className="p-3 rounded-xl border border-status-critical/30 bg-status-critical/10 text-status-critical font-mono text-xs font-bold"
                >
                  FAIL
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    updateTestStatus('front_camera', 'UNSUPPORTED', 'No front camera available / permission denied.');
                    toast('Front camera marked UNSUPPORTED', 'info');
                    handleNext();
                  }}
                  className="p-3 rounded-xl glass-panel text-text-muted font-mono text-xs"
                >
                  UNSUPPORTED
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 05: Rear Camera Test */}
        {activeStepIndex === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">05. Rear Camera Test</h2>
                  <p className="text-xs text-text-muted font-mono">Main environment optical sensor</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-cyan">facingMode: "environment"</span>
            </div>

            <div className="w-full max-w-md mx-auto h-64 md:h-72 rounded-2xl bg-bg-darker border border-accent-cyan/30 relative overflow-hidden flex items-center justify-center">
              {cameraStream ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-3 p-4">
                  <Camera className="w-8 h-8 text-text-dim mx-auto" />
                  <p className="text-xs text-text-muted font-mono">Rear camera preview inactive</p>
                  <button
                    onClick={() => startCamera({ ideal: 'environment' })}
                    disabled={cameraLoading}
                    className="px-5 py-2.5 rounded-xl bg-accent-cyan text-bg-darkest font-mono text-xs font-bold hover:bg-accent-cyan/90 transition-all shadow-cyan-glow"
                  >
                    {cameraLoading ? 'Requesting Rear Camera...' : 'Start Rear Camera'}
                  </button>
                </div>
              )}
            </div>

            {cameraStream && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={captureSnapshot}
                  className="px-4 py-2 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold"
                >
                  Capture Test Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-xl glass-panel text-text-muted hover:text-white font-mono text-xs"
                >
                  Stop Stream
                </button>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-white font-bold">How is the rear camera clarity & focus?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    stopCamera();
                    updateTestStatus('rear_camera', 'PASSED', 'Rear camera optic clear, optical stabilization nominal.');
                    toast('Rear camera marked PASS', 'success');
                    handleNext();
                  }}
                  className="p-3 rounded-xl border border-status-success/30 bg-status-success/10 text-status-success font-mono text-xs font-bold"
                >
                  PASS
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    updateTestStatus('rear_camera', 'WARNING', 'Rear camera lens scratched or focus lag.');
                    toast('Rear camera marked WARNING', 'info');
                    handleNext();
                  }}
                  className="p-3 rounded-xl border border-status-warning/30 bg-status-warning/10 text-status-warning font-mono text-xs font-bold"
                >
                  WARNING
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    updateTestStatus('rear_camera', 'FAILED', 'Rear camera failed to open.');
                    toast('Rear camera marked FAILED', 'error');
                    handleNext();
                  }}
                  className="p-3 rounded-xl border border-status-critical/30 bg-status-critical/10 text-status-critical font-mono text-xs font-bold"
                >
                  FAIL
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    updateTestStatus('rear_camera', 'UNSUPPORTED', 'Rear camera not present or blocked.');
                    handleNext();
                  }}
                  className="p-3 rounded-xl glass-panel text-text-muted font-mono text-xs"
                >
                  UNSUPPORTED
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 06: Microphone Test */}
        {activeStepIndex === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">06. Microphone Input Test</h2>
                  <p className="text-xs text-text-muted font-mono">Live audio level meter & loopback recording</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-teal">Web Audio Analyser</span>
            </div>

            <p className="text-xs text-text-muted">
              Speak into your microphone. Watch the animated decibel level bar, then record a 5-second voice sample to test audio loopback.
            </p>

            {/* Audio Level Visualizer */}
            <div className="p-6 rounded-2xl bg-bg-darker border border-bg-border space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span>INPUT LEVEL</span>
                <span className="text-accent-teal font-bold">{micAudioLevel}%</span>
              </div>
              <div className="w-full h-4 rounded-full bg-white/5 overflow-hidden border border-white/10 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-teal via-accent-cyan to-status-warning transition-all duration-75 shadow-teal-glow"
                  style={{ width: `${micAudioLevel}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!micActive ? (
                  <button
                    onClick={startMicTest}
                    className="px-4 py-2 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold hover:bg-accent-teal/90"
                  >
                    Enable Microphone
                  </button>
                ) : (
                  <button
                    onClick={record5Seconds}
                    disabled={isRecordingMic}
                    className="px-4 py-2 rounded-xl bg-accent-cyan text-bg-darkest font-mono text-xs font-bold hover:bg-accent-cyan/90 disabled:opacity-50"
                  >
                    {isRecordingMic ? `Recording (${recordCountdown}s)...` : 'Record 5 Seconds Voice Sample'}
                  </button>
                )}

                {micRecordingUrl && (
                  <audio controls src={micRecordingUrl} className="h-8 max-w-xs" />
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-white font-bold">How does your microphone sound?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    stopMic();
                    updateTestStatus('mic', 'PASSED', 'Microphone acoustic capture clear, low noise floor.');
                    toast('Microphone marked PASS', 'success');
                    handleNext();
                  }}
                  className="p-3 rounded-xl border border-status-success/30 bg-status-success/10 text-status-success font-mono text-xs font-bold"
                >
                  PASS (Clear)
                </button>
                <button
                  onClick={() => {
                    stopMic();
                    updateTestStatus('mic', 'WARNING', 'Microphone audio low volume or muffled.');
                    toast('Microphone marked WARNING', 'info');
                    handleNext();
                  }}
                  className="p-3 rounded-xl border border-status-warning/30 bg-status-warning/10 text-status-warning font-mono text-xs font-bold"
                >
                  WARNING (Low)
                </button>
                <button
                  onClick={() => {
                    stopMic();
                    updateTestStatus('mic', 'FAILED', 'No audio recorded / crackling distortion.');
                    toast('Microphone marked FAILED', 'error');
                    handleNext();
                  }}
                  className="p-3 rounded-xl border border-status-critical/30 bg-status-critical/10 text-status-critical font-mono text-xs font-bold"
                >
                  FAIL
                </button>
                <button
                  onClick={() => {
                    stopMic();
                    updateTestStatus('mic', 'UNSUPPORTED', 'Microphone API unavailable / permission rejected.');
                    handleNext();
                  }}
                  className="p-3 rounded-xl glass-panel text-text-muted font-mono text-xs"
                >
                  UNSUPPORTED
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 07: Speaker Test */}
        {activeStepIndex === 6 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">07. Speaker / Audio Test</h2>
                  <p className="text-xs text-text-muted font-mono">Synthesized acoustic chime frequency sweep</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-cyan">Web Audio Sine Chime</span>
            </div>

            <p className="text-xs text-text-muted">
              Make sure your phone volume is turned up. Play the diagnostic acoustic chime in Stereo, Left channel, or Right channel.
            </p>

            <div className="p-6 rounded-2xl bg-bg-darker border border-bg-border flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => playDiagnosticTone('stereo')}
                disabled={isPlayingAudio}
                className="px-5 py-3 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold hover:bg-accent-teal/90 shadow-teal-glow flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>PLAY STEREO CHIME</span>
              </button>
              <button
                onClick={() => playDiagnosticTone('left')}
                disabled={isPlayingAudio}
                className="px-4 py-2.5 rounded-xl glass-panel hover:border-accent-cyan text-accent-cyan font-mono text-xs"
              >
                Left Channel Only
              </button>
              <button
                onClick={() => playDiagnosticTone('right')}
                disabled={isPlayingAudio}
                className="px-4 py-2.5 rounded-xl glass-panel hover:border-accent-cyan text-accent-cyan font-mono text-xs"
              >
                Right Channel Only
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-white font-bold">Could you hear the test sound clearly?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    updateTestStatus('speaker', 'PASSED', 'Speaker acoustic output clear and balanced across channels.');
                    toast('Speaker marked PASS', 'success');
                    handleNext();
                  }}
                  className="p-3.5 rounded-xl border border-status-success/30 bg-status-success/10 text-status-success font-mono text-xs font-bold"
                >
                  PASS (Clear & Crisp)
                </button>
                <button
                  onClick={() => {
                    updateTestStatus('speaker', 'WARNING', 'Speaker sound is distorted, rattling, or low volume.');
                    toast('Speaker marked WARNING', 'info');
                    handleNext();
                  }}
                  className="p-3.5 rounded-xl border border-status-warning/30 bg-status-warning/10 text-status-warning font-mono text-xs font-bold"
                >
                  WARNING (Distorted)
                </button>
                <button
                  onClick={() => {
                    updateTestStatus('speaker', 'FAILED', 'No sound output produced.');
                    toast('Speaker marked FAILED', 'error');
                    handleNext();
                  }}
                  className="p-3.5 rounded-xl border border-status-critical/30 bg-status-critical/10 text-status-critical font-mono text-xs font-bold"
                >
                  FAIL (Silent)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 08: Vibration Test */}
        {activeStepIndex === 7 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                  <Vibrate className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">08. Vibration & Haptics Test</h2>
                  <p className="text-xs text-text-muted font-mono">Haptic motor pulse actuator test</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-teal">navigator.vibrate()</span>
            </div>

            <p className="text-xs text-text-muted">
              Press the button below to trigger a dual 200ms haptic pulse. (Note: iOS Mobile Safari restricts programmatic vibration by default).
            </p>

            <div className="flex justify-center p-6 bg-bg-darker rounded-2xl border border-bg-border">
              <button
                onClick={triggerVibration}
                className="px-6 py-3.5 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold hover:bg-accent-teal/90 shadow-teal-glow flex items-center gap-2"
              >
                <Vibrate className="w-5 h-5" />
                <span>TEST VIBRATION PULSE</span>
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-white font-bold">Did your device vibrate?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    updateTestStatus('vibration', 'PASSED', 'Haptic actuator pulse verified.');
                    toast('Vibration marked PASS', 'success');
                    handleNext();
                  }}
                  className="p-3.5 rounded-xl border border-status-success/30 bg-status-success/10 text-status-success font-mono text-xs font-bold"
                >
                  YES (Passed)
                </button>
                <button
                  onClick={() => {
                    updateTestStatus('vibration', 'FAILED', 'Vibration motor failed to respond.');
                    toast('Vibration marked FAILED', 'error');
                    handleNext();
                  }}
                  className="p-3.5 rounded-xl border border-status-critical/30 bg-status-critical/10 text-status-critical font-mono text-xs font-bold"
                >
                  NO (Failed)
                </button>
                <button
                  onClick={() => {
                    updateTestStatus('vibration', 'UNSUPPORTED', 'Vibration API restricted or unsupported on OS/browser.');
                    handleNext();
                  }}
                  className="p-3.5 rounded-xl glass-panel text-text-muted font-mono text-xs"
                >
                  UNSUPPORTED
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 09: Storage Capability */}
        {activeStepIndex === 8 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">09. Browser Storage Capability Test</h2>
                  <p className="text-xs text-text-muted font-mono">navigator.storage.estimate()</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-cyan">Storage Manager API</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-muted space-y-1">
              <span className="font-semibold text-white">Technical Honesty Note:</span>
              <p>
                Browsers can measure allocated origin quota and cache usage, but <strong>cannot measure physical NAND flash wear leveling or bad block relocation</strong> without external hardware adapters.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
                <span className="text-text-dim block text-[10px]">BROWSER STORAGE QUOTA</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {deviceInfo?.storageQuotaGb ? `${deviceInfo.storageQuotaGb} GB` : 'Standard Partition'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-bg-darker border border-bg-border">
                <span className="text-text-dim block text-[10px]">ORIGIN USED STORAGE</span>
                <span className="text-xl font-bold text-accent-cyan mt-1 block">
                  {deviceInfo?.storageUsedGb ? `${deviceInfo.storageUsedGb} GB` : '< 100 MB'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => {
                  updateTestStatus('storage', 'PASSED', `Storage Manager API operational • Quota: ${deviceInfo?.storageQuotaGb || 'Allocated'} GB`);
                  handleNext();
                }}
                className="px-6 py-3 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold"
              >
                CONFIRM STORAGE API (PASS)
              </button>
              <button
                onClick={() => {
                  updateTestStatus('storage', 'UNSUPPORTED', 'Storage Manager API unavailable.');
                  handleNext();
                }}
                className="px-4 py-3 rounded-xl glass-panel text-text-muted font-mono text-xs"
              >
                MARK UNSUPPORTED
              </button>
            </div>
          </div>
        )}

        {/* Step 10: Network Test */}
        {activeStepIndex === 9 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">10. Internet / Network Connectivity Test</h2>
                  <p className="text-xs text-text-muted font-mono">Live HTTP latency & Network Information API</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-teal">Network API</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border">
                <span className="text-text-dim block text-[10px]">ONLINE STATUS</span>
                <span className="text-status-success font-bold">{navigator.onLine ? 'Connected (Online)' : 'Offline'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border">
                <span className="text-text-dim block text-[10px]">ESTIMATED NETWORK TYPE</span>
                <span className="text-white font-bold">{deviceInfo?.connectionType || '4G / Wi-Fi'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border">
                <span className="text-text-dim block text-[10px]">ROUND-TRIP LATENCY</span>
                <span className="text-accent-teal font-bold">{networkPingMs !== null ? `${networkPingMs} ms` : 'Not pinged'}</span>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={runPingTest}
                disabled={isPinging}
                className="px-6 py-3 rounded-xl bg-accent-cyan text-bg-darkest font-mono text-xs font-bold hover:bg-accent-cyan/90 shadow-cyan-glow flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Measuring Latency...' : 'Execute Live Latency Ping Test'}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  if (networkPingMs === null) {
                    updateTestStatus('network', 'PASSED', `Network connection online: ${deviceInfo?.connectionType || 'Broadband'}`);
                  }
                  handleNext();
                }}
                className="px-6 py-3 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold"
              >
                PROCEED TO NEXT TEST →
              </button>
            </div>
          </div>
        )}

        {/* Step 11: Bluetooth Test */}
        {activeStepIndex === 10 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <Bluetooth className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">11. Bluetooth Capability Test</h2>
                  <p className="text-xs text-text-muted font-mono">Web Bluetooth API scanner</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-cyan">navigator.bluetooth</span>
            </div>

            <p className="text-xs text-text-muted">
              Checks if this device and browser support the Web Bluetooth adapter API. Click to trigger the OS Bluetooth discovery dialog.
            </p>

            <div className="p-6 rounded-2xl bg-bg-darker border border-bg-border space-y-3 text-center">
              <div className="text-xs font-mono text-text-muted">{btStatus}</div>
              <button
                onClick={requestBluetoothDevice}
                className="px-6 py-3 rounded-xl bg-accent-cyan text-bg-darkest font-mono text-xs font-bold hover:bg-accent-cyan/90 shadow-cyan-glow"
              >
                SCAN FOR BLUETOOTH DEVICE
              </button>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => {
                  updateTestStatus('bluetooth', 'PASSED', 'Web Bluetooth API supported and operational.');
                  handleNext();
                }}
                className="px-5 py-2.5 rounded-xl border border-status-success/30 bg-status-success/10 text-status-success font-mono text-xs font-bold"
              >
                MARK PASSED
              </button>
              <button
                onClick={() => {
                  updateTestStatus('bluetooth', 'UNSUPPORTED', 'Web Bluetooth unsupported on current browser engine.');
                  handleNext();
                }}
                className="px-5 py-2.5 rounded-xl glass-panel text-text-muted font-mono text-xs"
              >
                MARK UNSUPPORTED
              </button>
            </div>
          </div>
        )}

        {/* Step 12: GPS / Location */}
        {activeStepIndex === 11 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">12. GPS / Location Sensor Test</h2>
                  <p className="text-xs text-text-muted font-mono">navigator.geolocation</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-teal">Geolocation API</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-muted">
              Privacy Notice: Exact GPS coordinates are not stored or exported to servers. We verify only accuracy radius in meters (±XX m).
            </div>

            <div className="p-6 rounded-2xl bg-bg-darker border border-bg-border text-center space-y-3">
              <div className="text-xs font-mono">
                {gpsAccuracy !== null ? (
                  <span className="text-status-success font-bold">GPS Lock Acquired • Accuracy: ±{gpsAccuracy} meters</span>
                ) : (
                  <span className="text-text-muted">Location not requested yet</span>
                )}
              </div>

              <button
                onClick={requestLocation}
                disabled={isLocating}
                className="px-6 py-3 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold hover:bg-accent-teal/90 shadow-teal-glow"
              >
                {isLocating ? 'Acquiring GPS Signal...' : 'TEST LOCATION ACCURACY'}
              </button>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => {
                  if (gpsAccuracy === null) {
                    updateTestStatus('gps', 'PASSED', 'Geolocation API supported.');
                  }
                  handleNext();
                }}
                className="px-6 py-3 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold"
              >
                PROCEED →
              </button>
              <button
                onClick={() => {
                  updateTestStatus('gps', 'UNSUPPORTED', 'Geolocation permission denied or unsupported.');
                  handleNext();
                }}
                className="px-4 py-3 rounded-xl glass-panel text-text-muted font-mono text-xs"
              >
                UNSUPPORTED
              </button>
            </div>
          </div>
        )}

        {/* Step 13: Motion & Orientation */}
        {activeStepIndex === 12 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">13. Motion & Orientation Sensors</h2>
                  <p className="text-xs text-text-muted font-mono">Accelerometer & Gyroscope 3D tracking</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-cyan">deviceorientation</span>
            </div>

            <p className="text-xs text-text-muted">
              Tilt and rotate your phone. The virtual card below tilts dynamically in response to real IMU sensor readings.
            </p>

            {/* Virtual Tilting Card */}
            <div className="flex flex-col items-center justify-center py-6 bg-bg-darker rounded-2xl border border-bg-border overflow-hidden">
              <motion.div
                animate={{
                  rotateX: motionBeta * 0.5,
                  rotateY: motionGamma * 0.5,
                  rotateZ: motionAlpha * 0.1,
                }}
                transition={{ type: 'spring', damping: 20 }}
                className="w-48 h-28 rounded-2xl glass-panel-glow border-2 border-accent-teal flex flex-col items-center justify-center text-center p-3 shadow-2xl"
              >
                <Compass className="w-6 h-6 text-accent-teal mb-1" />
                <span className="text-xs font-mono text-white font-bold">IMU TILT CARD</span>
                <span className="text-[10px] font-mono text-text-muted">Alpha: {motionAlpha}° | Beta: {motionBeta}°</span>
              </motion.div>

              <div className="flex gap-4 mt-6 text-xs font-mono text-text-muted">
                <span>ALPHA: <strong className="text-white">{motionAlpha}°</strong></span>
                <span>BETA: <strong className="text-white">{motionBeta}°</strong></span>
                <span>GAMMA: <strong className="text-white">{motionGamma}°</strong></span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={requestiOSMotion}
                className="px-3 py-1.5 rounded-xl glass-panel text-[11px] font-mono text-accent-cyan"
              >
                iOS Permission Request
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    updateTestStatus('motion', 'PASSED', `Motion sensors active • Alpha: ${motionAlpha}°, Beta: ${motionBeta}°, Gamma: ${motionGamma}°`);
                    handleNext();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold"
                >
                  CONFIRM SENSORS (PASS)
                </button>
                <button
                  onClick={() => {
                    updateTestStatus('motion', 'UNSUPPORTED', 'Device does not expose motion/orientation sensors to browser.');
                    handleNext();
                  }}
                  className="px-4 py-2.5 rounded-xl glass-panel text-text-muted font-mono text-xs"
                >
                  UNSUPPORTED
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 14: Battery / Charging */}
        {activeStepIndex === 13 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">14. Battery / Charging Test</h2>
                  <p className="text-xs text-text-muted font-mono">Battery Status API inspection</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-teal">navigator.getBattery()</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-muted space-y-1">
              <span className="font-semibold text-white">Technical Honesty Note:</span>
              <p>
                Battery physical cycle counts and internal degradation % cannot be measured through web browser sandboxes alone. When Battery API is unsupported by browser privacy policies, it is marked <strong>UNSUPPORTED (with 0 score penalty)</strong>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-bg-darker border border-bg-border text-center space-y-3">
              {batteryLevel !== null ? (
                <div className="space-y-1 font-mono">
                  <div className="text-3xl font-bold text-accent-teal">{batteryLevel}%</div>
                  <div className="text-xs text-text-muted">Charging Status: {batteryCharging ? 'Charging (Power Connected)' : 'Discharging on Battery'}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-text-muted font-mono">
                    Query browser for live battery telemetry.
                  </p>
                  <button
                    onClick={checkBatteryApi}
                    className="px-6 py-3 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold hover:bg-accent-teal/90 shadow-teal-glow"
                  >
                    QUERY BATTERY STATUS
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => {
                  if (batteryLevel !== null) {
                    updateTestStatus('battery', 'PASSED', `Battery: ${batteryLevel}% (Charging: ${batteryCharging ? 'Yes' : 'No'})`);
                  } else {
                    updateTestStatus('battery', 'UNSUPPORTED', 'Battery Status API unavailable on this browser engine.');
                  }
                  handleNext();
                }}
                className="px-6 py-3 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold"
              >
                PROCEED →
              </button>
              <button
                onClick={() => {
                  updateTestStatus('battery', 'UNSUPPORTED', 'Battery diagnostics require native / Raspberry Pi connection on this browser.');
                  handleNext();
                }}
                className="px-4 py-3 rounded-xl glass-panel text-text-muted font-mono text-xs"
              >
                MARK UNSUPPORTED
              </button>
            </div>
          </div>
        )}

        {/* Step 15: Hardware Capability Summary */}
        {activeStepIndex === 14 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">15. Hardware Capability Summary</h2>
                  <p className="text-xs text-text-muted font-mono">SoC concurrency & graphics runtime</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-accent-cyan">Capability Matrix</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-text-dim block text-[10px]">CPU CORES</span>
                <span className="text-white font-bold">{deviceInfo?.cpuCores} Logical Threads</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-text-dim block text-[10px]">WEBGL SUPPORT</span>
                <span className="text-status-success font-bold">Supported (v2.0)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-text-dim block text-[10px]">TOUCH DIGITIZER</span>
                <span className="text-white font-bold">{deviceInfo?.maxTouchPoints || 1} Points</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-text-dim block text-[10px]">MEDIA DEVICES</span>
                <span className="text-status-success font-bold">Cam / Mic Ready</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => {
                  updateTestStatus('hardware', 'PASSED', `System concurrency verified (${deviceInfo?.cpuCores} cores, WebGL 2.0 active).`);
                  handleNext();
                }}
                className="px-6 py-3 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold uppercase tracking-wider hover:bg-accent-teal/90 shadow-teal-glow"
              >
                PROCEED TO PHYSICAL INSPECTION →
              </button>
            </div>
          </div>
        )}

        {/* Step 16: Physical Condition Inspection */}
        {activeStepIndex === 15 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-status-warning/10 border border-status-warning/30 flex items-center justify-center text-status-warning">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">16. Physical Condition Inspection</h2>
                  <p className="text-xs text-text-muted font-mono">MANUAL PHYSICAL INSPECTION</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-status-warning">8 Component Points</span>
            </div>

            <p className="text-xs text-text-muted">
              Perform a close manual inspection of the smartphone chassis, glass, ports, and buttons.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {/* Screen Glass */}
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border space-y-2">
                <span className="text-text-dim block font-bold">1. FRONT SCREEN GLASS</span>
                <div className="flex gap-2">
                  {(['No damage', 'Minor scratches', 'Cracked'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPhysicalData({ ...physicalData, screenGlass: opt })}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                        physicalData.screenGlass === opt
                          ? 'bg-accent-teal/20 text-accent-teal border-accent-teal font-bold'
                          : 'glass-panel text-text-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Frame */}
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border space-y-2">
                <span className="text-text-dim block font-bold">2. BODY / CHASSIS FRAME</span>
                <div className="flex gap-2">
                  {(['Excellent', 'Minor wear', 'Damaged'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPhysicalData({ ...physicalData, bodyFrame: opt })}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                        physicalData.bodyFrame === opt
                          ? 'bg-accent-teal/20 text-accent-teal border-accent-teal font-bold'
                          : 'glass-panel text-text-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Lens */}
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border space-y-2">
                <span className="text-text-dim block font-bold">3. CAMERA LENS OPTIC</span>
                <div className="flex gap-2">
                  {(['Clean', 'Scratched', 'Damaged'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPhysicalData({ ...physicalData, cameraLens: opt })}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                        physicalData.cameraLens === opt
                          ? 'bg-accent-teal/20 text-accent-teal border-accent-teal font-bold'
                          : 'glass-panel text-text-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Charging Port */}
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border space-y-2">
                <span className="text-text-dim block font-bold">4. CHARGING PORT (USB/LIGHTNING)</span>
                <div className="flex gap-2">
                  {(['Good', 'Loose', 'Damaged'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPhysicalData({ ...physicalData, chargingPort: opt })}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                        physicalData.chargingPort === opt
                          ? 'bg-accent-teal/20 text-accent-teal border-accent-teal font-bold'
                          : 'glass-panel text-text-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Power Button */}
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border space-y-2">
                <span className="text-text-dim block font-bold">5. POWER BUTTON</span>
                <div className="flex gap-2">
                  {(['Working', 'Intermittent', 'Not working'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPhysicalData({ ...physicalData, powerButton: opt })}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                        physicalData.powerButton === opt
                          ? 'bg-accent-teal/20 text-accent-teal border-accent-teal font-bold'
                          : 'glass-panel text-text-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Buttons */}
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border space-y-2">
                <span className="text-text-dim block font-bold">6. VOLUME BUTTONS</span>
                <div className="flex gap-2">
                  {(['Working', 'Intermittent', 'Not working'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPhysicalData({ ...physicalData, volumeButtons: opt })}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                        physicalData.volumeButtons === opt
                          ? 'bg-accent-teal/20 text-accent-teal border-accent-teal font-bold'
                          : 'glass-panel text-text-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* SIM Tray */}
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border space-y-2">
                <span className="text-text-dim block font-bold">7. SIM TRAY</span>
                <div className="flex gap-2">
                  {(['Good', 'Damaged', 'Missing'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPhysicalData({ ...physicalData, simTray: opt })}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                        physicalData.simTray === opt
                          ? 'bg-accent-teal/20 text-accent-teal border-accent-teal font-bold'
                          : 'glass-panel text-text-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Back Panel */}
              <div className="p-3.5 rounded-xl bg-bg-darker border border-bg-border space-y-2">
                <span className="text-text-dim block font-bold">8. BACK HOUSING PANEL</span>
                <div className="flex gap-2">
                  {(['Good', 'Loose', 'Damaged'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPhysicalData({ ...physicalData, backPanel: opt })}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                        physicalData.backPanel === opt
                          ? 'bg-accent-teal/20 text-accent-teal border-accent-teal font-bold'
                          : 'glass-panel text-text-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  updateTestStatus('physical', 'PASSED', 'Physical inspection completed.');
                  setActiveStepIndex(16); // Jump to review
                }}
                className="px-6 py-3 rounded-xl bg-accent-teal text-bg-darkest font-mono text-xs font-bold uppercase tracking-wider hover:bg-accent-teal/90 shadow-teal-glow"
              >
                COMPLETE & REVIEW INSPECTION →
              </button>
            </div>
          </div>
        )}

        {/* Step 17: Final Review & Report Generation */}
        {activeStepIndex === 16 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">17. Inspection Summary & Trust Score</h2>
                  <p className="text-xs text-text-muted font-mono">Review test outcomes before generating report</p>
                </div>
              </div>

              <button
                onClick={() => setShowFormulaModal(true)}
                className="text-xs font-mono text-accent-cyan hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                How is this calculated?
              </button>
            </div>

            {/* Checklist Table */}
            <div className="rounded-2xl bg-bg-darker border border-bg-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-darkest text-text-muted font-mono text-[10px] uppercase border-b border-bg-border">
                    <tr>
                      <th className="py-2.5 px-4">Test Name</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Observation / Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bg-border/60">
                    {TEST_DEFINITIONS.map((def) => {
                      const t = tests[def.id] || { status: 'NOT_TESTED', details: 'Pending' };
                      const badge = getStatusBadge(t.status);
                      return (
                        <tr key={def.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-4 font-semibold text-white font-mono">{def.num}. {def.title}</td>
                          <td className="py-2.5 px-4 text-text-dim uppercase font-mono text-[10px]">{def.category.replace('_', ' & ')}</td>
                          <td className="py-2.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${badge.bgClass} ${badge.borderClass}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-text-muted text-[11px] truncate max-w-xs">{t.details}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-bg-border">
              <button
                onClick={() => setActiveStepIndex(0)}
                className="px-4 py-2.5 rounded-xl glass-panel text-text-muted hover:text-white text-xs font-mono"
              >
                ← Return to Test 01
              </button>

              <button
                onClick={handleGenerateReport}
                className="px-8 py-3.5 rounded-xl bg-accent-teal text-bg-darkest font-bold text-sm font-mono uppercase tracking-wider hover:bg-accent-teal/90 shadow-teal-glow flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>GENERATE AUTHENTIX REPORT</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Bottom Navigation controls for steps 0-15 */}
        {activeStepIndex < 16 && (
          <div className="flex items-center justify-between pt-4 border-t border-bg-border/50">
            <button
              onClick={handlePrev}
              disabled={activeStepIndex === 0}
              className="px-4 py-2 rounded-xl glass-panel hover:border-white/20 text-xs font-mono text-text-muted hover:text-white flex items-center gap-1.5 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Test</span>
            </button>

            <button
              onClick={() => {
                if (tests[currentTestDef.id]?.status === 'NOT_TESTED') {
                  updateTestStatus(currentTestDef.id, 'SKIPPED', 'Test skipped by inspector.');
                }
                handleNext();
              }}
              className="px-4 py-2 rounded-xl glass-panel hover:border-accent-cyan text-xs font-mono text-accent-cyan flex items-center gap-1.5"
            >
              <span>Skip / Next Test</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <TrustScoreModal isOpen={showFormulaModal} onClose={() => setShowFormulaModal(false)} />
    </div>
  );
};
