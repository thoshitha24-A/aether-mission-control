import { useEffect, useRef, useState } from 'react';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { Icon } from '../components/Icon';
import { PageHead } from '../components/PageHead';
import { SignalWave } from '../components/SignalWave';
import { StatusDot } from '../components/SystemIndicator';
import { useMission } from '../context/MissionContext';
import { useTelemetry } from '../context/TelemetryContext';
import { useNow } from '../context/TimeContext';
import { CHANNELS, QUICK } from '../data/commsData';
import { MISSION, T0 } from '../data/missionData';
import { fmtDur, fmtUTC } from '../utils/format';

export function Communications() {
  const { messages, sendMessage } = useMission();
  const { values } = useTelemetry();
  const now = useNow();
  const [channel, setChannel] = useState('all');
  const [text, setText] = useState('');
  const streamRef = useRef(null);
  const inputRef = useRef(null);
  const shown = channel === 'all' ? messages : messages.filter((m) => m.src === channel);
  const lastLen = useRef(0);
  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    const own = messages.length && messages[messages.length - 1].own;
    if (nearBottom || own || lastLen.current === 0) el.scrollTop = el.scrollHeight;
    lastLen.current = messages.length;
  }, [shown.length, messages]);
  useEffect(() => { const el = streamRef.current; if (el) el.scrollTop = el.scrollHeight; }, [channel]);
  const send = (t) => {
    const v = (t ?? text).trim();
    if (!v) return;
    sendMessage(v);
    setText('');
    if (channel !== 'all' && channel !== 'control') setChannel('all');
    inputRef.current && inputRef.current.focus();
  };
  const bars = Math.round((values.signal / 100) * 5);
  const counts = messages.reduce((o, m) => ((o[m.src] = (o[m.src] || 0) + 1), o), {});
  const handover = 3 * 3600 + 12 * 60 - Math.floor((now - T0) / 1000);
  return (
    <div className="page">
      <PageHead title="Communications" desc="Mission voice loop transcript and uplink console. Messages you send travel with the real one-way light time to the Moon.">
        <span className="live"><StatusDot cls="ok" pulse />Link established</span>
      </PageHead>
      <div className="comms-grid">
        <nav className="panel ch-list" aria-label="Channels">
          <div className="panel-head"><h2 className="label">Channels</h2></div>
          <ul>
            {[['all', 'All channels', messages.length], ...Object.entries(CHANNELS).map(([k, c]) => [k, c.label, counts[k] || 0])].map(([k, label, n]) => (
              <li key={k}>
                <button type="button" aria-pressed={channel === k} onClick={() => setChannel(k)} className={'ch src-' + k}>
                  <span className="ch-mark" aria-hidden="true" />{label}<span className="num ch-n">{n}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section className="panel instrument console" aria-label="Message stream">
          <div className="panel-head">
            <h2 className="label">{channel === 'all' ? 'All channels' : CHANNELS[channel].label}</h2>
            <span className="meta num">UTC {fmtUTC(new Date(now))}</span>
          </div>
          <div className="stream" ref={streamRef} role="log" aria-live="polite" aria-relevant="additions">
            {shown.map((m) => (
              <div key={m.id} className={'msg src-' + m.src + (m.own ? ' own' : '')}>
                <span className="num msg-t">[{fmtUTC(new Date(m.t))}]</span>
                <span className="msg-src">{CHANNELS[m.src].label}{m.own ? ' (you)' : ''}</span>
                <p className="msg-text">{m.text}</p>
                {m.own && <span className={'msg-status ' + m.status}>{m.status === 'uplink' ? <>Uplinking<span className="dots" aria-hidden="true"><i /><i /><i /></span></> : <><Icon name="check" size={12} />Delivered in 1.28 s</>}</span>}
              </div>
            ))}
            {!shown.length && <p className="empty">No traffic on this channel yet. Messages appear here as they arrive.</p>}
          </div>
          <div className="composer">
            <div className="quick" role="group" aria-label="Quick messages">
              {QUICK.map((q) => <button key={q} type="button" className="btn sm" onClick={() => send(q)}>{q}</button>)}
            </div>
            <form className="compose-row" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <label htmlFor="uplink" className="sr">Message to AETHER-7</label>
              <input id="uplink" ref={inputRef} value={text} onChange={(e) => setText(e.target.value.slice(0, 280))} placeholder="Transmit as Mission Control" autoComplete="off" />
              <span className="num char-n" aria-hidden="true">{text.length}/280</span>
              <button type="submit" className="btn primary" disabled={!text.trim()}><Icon name="send" size={15} />Transmit</button>
            </form>
          </div>
        </section>

        <aside className="panel link-panel" aria-label="Link status">
          <div className="panel-head"><h2 className="label">Link</h2></div>
          <div className="panel-body">
            <div className="sig">
              <div className="sig-bars" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= bars ? 'on' : ''} style={{ height: 6 + i * 4 }} />)}</div>
              <div><span className="label">Signal strength</span><div className="sig-v"><AnimatedNumber value={values.signal} dec={1} /><span className="unit">%</span></div></div>
            </div>
            <SignalWave strength={values.signal} />
            <dl className="kv">
              <div><dt>Ground station</dt><dd>{MISSION.station}</dd></div>
              <div><dt>Band</dt><dd>Ka, 26.5 GHz</dd></div>
              <div><dt>Downlink</dt><dd className="num">2.4 Mbps</dd></div>
              <div><dt>Uplink</dt><dd className="num">256 kbps</dd></div>
              <div><dt>One-way light time</dt><dd className="num">1.28 s</dd></div>
              <div><dt>Link margin</dt><dd className="num">{(3.2 + (values.signal - 98) * 0.4).toFixed(1)} dB</dd></div>
              <div><dt>Handover to {MISSION.nextStation}</dt><dd className="num">{fmtDur(handover * 1000)}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
