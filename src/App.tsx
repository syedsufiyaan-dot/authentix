import { useMemo, useState } from 'react'
import { BatteryCharging, Bluetooth, CheckCircle2, Cpu, Download, HardDrive, ShieldCheck, Smartphone, Wifi, Zap } from 'lucide-react'
import jsPDF from 'jspdf'

type Test = { name: string; score: number; detail: string; icon: typeof BatteryCharging }

const tests: Test[] = [
  { name: 'Battery Health', score: 92, detail: 'Battery condition appears healthy', icon: BatteryCharging },
  { name: 'Charging', score: 84, detail: 'Charging performance is within normal range', icon: Zap },
  { name: 'Storage', score: 89, detail: 'Storage capability check passed', icon: HardDrive },
  { name: 'Connectivity', score: 96, detail: 'Network capabilities available', icon: Wifi },
  { name: 'Bluetooth', score: 94, detail: 'Bluetooth capability detected', icon: Bluetooth },
  { name: 'Hardware', score: 90, detail: 'Core browser-visible hardware checks passed', icon: Cpu },
]

export default function App() {
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)
  const trustScore = useMemo(() => Math.round(tests.reduce((a, b) => a + b.score, 0) / tests.length), [])

  const runScan = () => {
    setScanning(true)
    setScanned(false)
    window.setTimeout(() => { setScanning(false); setScanned(true) }, 1500)
  }

  const downloadReport = () => {
    const pdf = new jsPDF()
    pdf.setFontSize(22); pdf.text('AuthentiX Device Report', 20, 25)
    pdf.setFontSize(13); pdf.text(`Trust Score: ${trustScore}/100`, 20, 40)
    tests.forEach((t, i) => pdf.text(`${t.name}: ${t.score}/100 - ${t.detail}`, 20, 55 + i * 10))
    pdf.setFontSize(10); pdf.text('Prototype diagnostic report. Results are informational and are not manufacturer certification.', 20, 125, { maxWidth: 170 })
    pdf.save('authentix-device-report.pdf')
  }

  return <div className="app">
    <header className="nav">
      <a className="brand" href="#home"><span className="brandIcon"><ShieldCheck size={23}/></span>Authenti<span>X</span></a>
      <nav><a href="#features">Diagnostics</a><a href="#how">How it works</a><a href="#about">About</a></nav>
      <a className="smallBtn" href="#scanner">Run Diagnostic</a>
    </header>

    <main>
      <section id="home" className="hero">
        <div className="badge"><span/> MOBILE DEVICE TRUST ANALYZER</div>
        <h1>Know the device.<br/><em>Trust the decision.</em></h1>
        <p>AuthentiX is a portable mobile-device diagnostic concept that evaluates key health indicators and turns them into a simple, transparent Trust Score.</p>
        <div className="heroButtons"><a className="primary" href="#scanner">Start Device Analysis <span>→</span></a><a className="secondary" href="#how">See how it works</a></div>
        <div className="heroStats"><div><b>6</b><span>Diagnostic areas</span></div><div><b>0–100</b><span>Trust Score</span></div><div><b>PDF</b><span>Device report</span></div></div>
      </section>

      <section id="scanner" className="scanner section">
        <div className="sectionHead"><span>DEVICE ANALYSIS</span><h2>Diagnostic Dashboard</h2><p>Run a demonstration of the AuthentiX diagnostic workflow.</p></div>
        <div className="dashboard">
          <div className="phonePanel">
            <div className={`phone ${scanning ? 'scanning' : ''}`}><div className="speaker"/><Smartphone size={74}/><strong>{scanning ? 'Analyzing…' : scanned ? 'Analysis complete' : 'Device ready'}</strong><small>{scanning ? 'Running diagnostic checks' : 'AuthentiX diagnostic interface'}</small>{scanning && <div className="scanline"/>}</div>
            <button className="primary full" onClick={runScan} disabled={scanning}>{scanning ? 'Running Diagnostics…' : scanned ? 'Run Again' : 'Run Diagnostic'}</button>
          </div>
          <div className="results">
            <div className="scoreCard"><div><span>OVERALL TRUST SCORE</span><h3>{scanned ? trustScore : '--'}<small>/100</small></h3><p>{scanned ? 'Strong overall device condition' : 'Run the diagnostic to generate a score'}</p></div><div className="ring" style={{'--score': scanned ? `${trustScore * 3.6}deg` : '0deg'} as React.CSSProperties}><div>{scanned ? <ShieldCheck/> : <Smartphone/>}</div></div></div>
            <div className="testGrid">{tests.map(({name,score,detail,icon:Icon}) => <article key={name}><div className="testIcon"><Icon/></div><div><b>{name}</b><small>{scanned ? detail : 'Waiting for analysis'}</small></div><strong>{scanned ? `${score}%` : '—'}</strong></article>)}</div>
            {scanned && <button className="secondary download" onClick={downloadReport}><Download size={17}/> Download Device Report</button>}
          </div>
        </div>
      </section>

      <section id="features" className="section"><div className="sectionHead"><span>WHAT WE ANALYZE</span><h2>One device. Multiple health signals.</h2></div><div className="features">{tests.map(({name,detail,icon:Icon},i)=><article key={name}><span>0{i+1}</span><Icon/><h3>{name}</h3><p>{detail}. AuthentiX combines this indicator with the other checks to build an overall assessment.</p></article>)}</div></section>

      <section id="how" className="section how"><div className="sectionHead"><span>HOW IT WORKS</span><h2>From device to decision.</h2></div><div className="steps"><div><b>01</b><Smartphone/><h3>Connect</h3><p>Connect or inspect the mobile device through the AuthentiX diagnostic interface.</p></div><i>→</i><div><b>02</b><Cpu/><h3>Analyze</h3><p>Raspberry Pi, sensors and software evaluate supported device health indicators.</p></div><i>→</i><div><b>03</b><ShieldCheck/><h3>Score</h3><p>Diagnostic results are combined into an easy-to-understand Trust Score.</p></div><i>→</i><div><b>04</b><CheckCircle2/><h3>Report</h3><p>Review the condition summary and export a clear diagnostic report.</p></div></div></section>

      <section id="about" className="section about"><div><span>ABOUT AUTHENTIX</span><h2>Built for smarter second-hand phone decisions.</h2></div><div><p>AuthentiX is a prototype portable Mobile Device Authenticity & Diagnostic Analyzer. The concept combines Raspberry Pi hardware, sensors and Python-based analysis to help users understand a smartphone's condition beyond its external appearance.</p><p className="note">AuthentiX provides diagnostic indicators and a decision-support score. It does not guarantee manufacturer authenticity, ownership status, or certify a device.</p></div></section>
    </main>
    <footer><a className="brand" href="#home"><ShieldCheck size={20}/>Authenti<span>X</span></a><p>Verify. Analyze. Trust.</p><small>© 2026 AuthentiX · Prototype Project</small></footer>
  </div>
}
