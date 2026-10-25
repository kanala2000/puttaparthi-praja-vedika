"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type PortraitKey = "mla" | "cm" | "incharge";
type Portraits = Record<PortraitKey, string>;

const portraitLabels: Record<PortraitKey, string> = {
  mla: "ఎమ్మెల్యే",
  cm: "ముఖ్యమంత్రి",
  incharge: "నియోజకవర్గ ఇన్‌చార్జ్",
};

const categories = [
  "రోడ్లు",
  "తాగునీరు",
  "మురుగు కాలువలు",
  "వీధి దీపాలు",
  "పింఛన్లు / సంక్షేమం",
  "పరిశుభ్రత",
  "వైద్యం",
  "విద్య",
  "వ్యవసాయం / సాగునీరు",
  "ఇతర సమస్య",
];

const initialPortraits: Portraits = { mla: "", cm: "", incharge: "" };

function ImageSlot({
  role,
  image,
  onUpload,
}: {
  role: PortraitKey;
  image?: string;
  onUpload?: (role: PortraitKey, file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={`portrait portrait-${role}`}>
      {image ? (
        // Uploaded portraits are compressed previews, not externally supplied identities.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="portrait-image" src={image} alt={portraitLabels[role]} />
      ) : (
        <div className="portrait-placeholder" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="img">
            <circle cx="32" cy="21" r="12" />
            <path d="M10 56c1-13 10-21 22-21s21 8 22 21" />
          </svg>
          <span>ఫోటో జోడించండి</span>
        </div>
      )}
      <strong>{portraitLabels[role]}</strong>
      {onUpload && (
        <>
          <input
            ref={inputRef}
            className="visually-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label={portraitLabels[role] + " ఫోటో ఎంచుకోండి"}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) onUpload(role, file);
              event.currentTarget.value = "";
            }}
          />
          <button className="small-upload" type="button" onClick={() => inputRef.current?.click()}>
            ఫోటో మార్చండి
          </button>
        </>
      )}
    </div>
  );
}

async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("దయచేసి చిత్రం ఫైల్‌ను ఎంచుకోండి.");
  if (file.size > 8 * 1024 * 1024) throw new Error("చిత్ర పరిమాణం 8 MB కంటే తక్కువగా ఉండాలి.");
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("చిత్రాన్ని తెరవలేకపోయాం. మరొక చిత్రం ఎంచుకోండి."));
    });
    const maxSide = 700;
    const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("చిత్రాన్ని కుదించలేకపోయాం.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } finally {
    URL.revokeObjectURL(source);
  }
}

export default function HomePage() {
  const [portraits, setPortraits] = useState<Portraits>(initialPortraits);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [issueId, setIssueId] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [recordingError, setRecordingError] = useState("");
  const [issueCategory, setIssueCategory] = useState(categories[0]);
  const [mandal, setMandal] = useState("");
  const [village, setVillage] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [trackId, setTrackId] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    setRecordingSupported(typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined");
    // Local preview settings are for a private prototype only; real admin storage needs authentication and server persistence.
    try {
      const stored = window.localStorage.getItem("praja-vedika-portraits");
      if (stored) setPortraits({ ...initialPortraits, ...JSON.parse(stored) });
    } catch {
      // Ignore invalid local demo data.
    }
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  async function handlePortraitUpload(role: PortraitKey, file: File) {
    setUploadMessage("");
    try {
      const compressed = await compressImage(file);
      const next = { ...portraits, [role]: compressed };
      setPortraits(next);
      try {
        window.localStorage.setItem("praja-vedika-portraits", JSON.stringify(next));
        setUploadMessage("ఫోటోను కుదించి ఈ బ్రౌజర్‌లో సేవ్ చేశాం. ఇది ప్రస్తుత డెమోలో మాత్రమే కనిపిస్తుంది.");
      } catch {
        setUploadMessage("ఫోటో కుదించబడింది; బ్రౌజర్ నిల్వ సరిపోలేదు. వాస్తవ వెబ్‌సైట్‌లో సురక్షిత సర్వర్ నిల్వను కలపాలి.");
      }
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "ఫోటోను అప్‌లోడ్ చేయలేకపోయాం.");
    }
  }

  async function startRecording() {
    setRecordingError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecordingError("ఈ బ్రౌజర్‌లో వాయిస్ రికార్డింగ్ అందుబాటులో లేదు. ఫోన్‌లో తాజా Chrome ఉపయోగించండి.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        setRecordingUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setRecording(true);
    } catch {
      setRecordingError("మైక్రోఫోన్ అనుమతి ఇవ్వలేకపోయాం. బ్రౌజర్ సెట్టింగ్స్‌లో అనుమతించి మళ్లీ ప్రయత్నించండి.");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecording(false);
  }

  async function submitPrototypeIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No real complaint is sent anywhere in this UI prototype.
    const generatedId = "PV-DEMO-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setIssueId(generatedId);
    setSubmitted(true);
  }

  function checkAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // This is deliberately a demo gate, not real authentication.
    if (adminPin === "demo123") {
      setAdminUnlocked(true);
      setAdminError("");
    } else {
      setAdminError("డెమో కోసం demo123 నమోదు చేయండి. వాస్తవ సైట్‌లో భద్రమైన లాగిన్ అవసరం.");
    }
  }

  return (
    <main>
      <div className="top-strip">
        <div className="top-strip-inner">
          <span>ప్రజల సమస్యలకు ఒక వేదిక</span>
          <span className="demo-label">ప్రదర్శన నమూనా · అధికారిక ప్రభుత్వ వెబ్‌సైట్ కాదు</span>
        </div>
      </div>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="పుట్టపర్తి ప్రజా వేదిక హోమ్">
          <span className="brand-mark" aria-hidden="true">ప్ర</span>
          <span><b>పుట్టపర్తి ప్రజా వేదిక</b><small>ప్రజా సమస్యల నమోదు మరియు అనుసరణ</small></span>
        </a>
        <nav aria-label="ప్రధాన మెనూ">
          <a href="#how">ఎలా పనిచేస్తుంది?</a>
          <button className="nav-admin" onClick={() => { setAdminOpen(true); setAdminUnlocked(false); }}>అడ్మిన్</button>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-backdrop" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> పుట్టపర్తి నియోజకవర్గం</span>
            <h1>మీ సమస్య <span>మా దృష్టికి.</span><br />మీ గొంతు వినిపించండి.</h1>
            <p>మీ గ్రామంలో ఉన్న సమస్యను మీరే నమోదు చేయండి. వివరాలు, ఫోటో లేదా మీ స్వరంతో చెప్పండి. మీ ఫిర్యాదు స్థితిని తెలుసుకోవడానికి ఈ వేదిక సహాయపడుతుంది.</p>
            <div className="hero-actions">
              <button className="button button-dark" onClick={() => { setIssueOpen(true); setSubmitted(false); }}>
                <span aria-hidden="true">＋</span> సమస్యను నమోదు చేయండి
              </button>
              <button className="button button-light" onClick={() => setTrackOpen(true)}>
                <span aria-hidden="true">⌕</span> ఫిర్యాదు స్థితి
              </button>
            </div>
            <div className="hero-promise">
              <span className="promise-icon" aria-hidden="true">✓</span>
              <span>సులభమైన నమోదు <i>·</i> గోప్యతకు ప్రాధాన్యం <i>·</i> తెలుగు మద్దతు</span>
            </div>
          </div>

          <div className="portrait-stage" aria-label="ప్రజా ప్రతినిధుల ఫోటో స్థలాలు">
            <div className="portrait-orbit orbit-one" />
            <div className="portrait-orbit orbit-two" />
            <div className="portrait-row">
              <ImageSlot role="mla" image={portraits.mla} />
              <ImageSlot role="cm" image={portraits.cm} />
              <ImageSlot role="incharge" image={portraits.incharge} />
            </div>
            <div className="portrait-note">ఫోటోలను నిర్వాహకులు జోడిస్తారు</div>
          </div>
        </div>
        <div className="hero-footer">
          <span><b>01</b> సమస్యను నమోదు చేయండి</span>
          <span><b>02</b> ఫిర్యాదు నంబర్ పొందండి</span>
          <span><b>03</b> స్థితిని అనుసరించండి</span>
        </div>
      </section>

      <section className="quick-section">
        <div className="section-heading">
          <div><span className="section-kicker">మీకు కావాల్సిన సేవ</span><h2>మీ సమస్యను ఎలా చెప్పాలనుకుంటున్నారు?</h2></div>
          <p>మీకు అనుకూలమైన పద్ధతిని ఎంచుకోండి.</p>
        </div>
        <div className="service-grid">
          <button className="service-card service-highlight" onClick={() => { setIssueOpen(true); setSubmitted(false); }}>
            <span className="service-icon icon-sun" aria-hidden="true">✳</span><span className="service-text"><b>సమస్యను నమోదు చేయండి</b><small>వివరాలు రాసి, ఫోటో జత చేయండి</small></span><span className="service-arrow" aria-hidden="true">↗</span>
          </button>
          <button className="service-card" onClick={() => { setIssueOpen(true); setSubmitted(false); }}>
            <span className="service-icon icon-mic" aria-hidden="true">♬</span><span className="service-text"><b>మీ సమస్యను గళంతో చెప్పండి</b><small>టైప్ చేయడం కష్టమైతే, వాయిస్ రికార్డ్ చేయండి</small></span><span className="service-arrow" aria-hidden="true">↗</span>
          </button>
          <button className="service-card" onClick={() => setTrackOpen(true)}>
            <span className="service-icon icon-track" aria-hidden="true">⌕</span><span className="service-text"><b>ఫిర్యాదు స్థితి తెలుసుకోండి</b><small>మీ ఫిర్యాదు నంబర్‌తో వెతకండి</small></span><span className="service-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
      </section>

      <section className="issues-section" id="how">
        <div className="section-heading">
          <div><span className="section-kicker">మీ ప్రాంతం · మీ సమస్య</span><h2>ఏ సమస్యనైనా తెలియజేయండి</h2></div>
          <p>గ్రామంలో లేదా పట్టణంలో మీరు ఎదుర్కొంటున్న సమస్యను వివరించండి.</p>
        </div>
        <div className="issue-chips">
          {categories.map((category) => <span key={category} className="issue-chip"><span>•</span>{category}</span>)}
        </div>
        <div className="notice-row">
          <span className="notice-symbol" aria-hidden="true">i</span>
          <p><b>గమనిక:</b> ఇది ప్రదర్శన నమూనా. ప్రస్తుతం ఫిర్యాదులు అధికారులకు పంపబడవు; వివరాలు ఈ డెమోలో శాశ్వతంగా నమోదు కావు. నిజమైన సేవ ప్రారంభించే ముందు అధికారిక అనుసంధానం, భద్రతా ఏర్పాట్లు, గోప్యతా విధానం అవసరం.</p>
        </div>
      </section>

      <section className="steps-section">
        <div className="steps-heading"><span className="section-kicker">మూడు సులభమైన దశలు</span><h2>మీ సమస్యను ఇలా తెలియజేయండి</h2></div>
        <div className="steps-grid">
          <div className="step"><span className="step-num">01</span><div className="step-icon">⌖</div><h3>ప్రాంతాన్ని ఎంచుకోండి</h3><p>మండలం, గ్రామం లేదా వార్డు, ప్రాంతం వివరాలు ఇవ్వండి.</p></div>
          <div className="step"><span className="step-num">02</span><div className="step-icon">♬</div><h3>సమస్యను వివరించండి</h3><p>తెలుగులో రాయండి లేదా మీ స్వరంతో రికార్డ్ చేయండి.</p></div>
          <div className="step"><span className="step-num">03</span><div className="step-icon">✓</div><h3>నంబర్‌తో అనుసరించండి</h3><p>నమూనాలో ఒక డెమో నంబర్ కనిపిస్తుంది. నిజమైన ట్రాకింగ్ తర్వాత అనుసంధానించబడుతుంది.</p></div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand"><span className="brand-mark">ప్ర</span><div><b>పుట్టపర్తి ప్రజా వేదిక</b><small>ప్రజల సమస్యలకు డిజిటల్ వేదిక</small></div></div>
        <p>స్వతంత్ర ప్రజా సేవ నమూనా · అధికారిక ప్రభుత్వ లేదా ప్రజాప్రతినిధి కార్యాలయ సైట్ కాదు.</p>
      </footer>

      {issueOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIssueOpen(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="issue-title">
            <button className="modal-close" aria-label="మూసివేయి" onClick={() => setIssueOpen(false)}>×</button>
            {!submitted ? (
              <>
                <span className="section-kicker">మీ మాట ముఖ్యం</span>
                <h2 id="issue-title">సమస్యను నమోదు చేయండి</h2>
                <p className="modal-intro">నక్షత్రం (*) ఉన్న వివరాలు తప్పనిసరి. ఇది ప్రస్తుతం డెమో ఫారమ్ మాత్రమే.</p>
                <form className="issue-form" onSubmit={submitPrototypeIssue}>
                  <label>సమస్య రకం *
                    <select required value={issueCategory} onChange={(event) => setIssueCategory(event.target.value)}>
                      {categories.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </label>
                  <div className="form-two">
                    <label>మండలం *
                      <input required value={mandal} onChange={(event) => setMandal(event.target.value)} placeholder="మండలం పేరు" />
                    </label>
                    <label>గ్రామం / వార్డు *
                      <input required value={village} onChange={(event) => setVillage(event.target.value)} placeholder="గ్రామం లేదా వార్డు" />
                    </label>
                  </div>
                  <label>ప్రాంతం / వీధి
                    <input value={area} onChange={(event) => setArea(event.target.value)} placeholder="కాలనీ, వీధి లేదా సమీప ప్రదేశం" />
                  </label>
                  <label>సమస్య వివరాలు
                    <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="మీ సమస్యను ఇక్కడ రాయండి..." />
                  </label>
                  <div className="record-box">
                    <div><b>🎙️ మీ సమస్యను గళంతో రికార్డ్ చేయండి</b><small>రాయడం కష్టమైతే వాయిస్‌లో చెప్పండి. సమర్పించే ముందు రికార్డింగ్‌ను వినండి.</small></div>
                    {recording ? <button className="button button-recording" type="button" onClick={stopRecording}>■ రికార్డింగ్ ఆపు</button> : <button className="button button-outline" type="button" onClick={startRecording}>● రికార్డ్ ప్రారంభించు</button>}
                    {recordingUrl && <audio className="audio-preview" controls src={recordingUrl}>మీ బ్రౌజర్ ఆడియోను ప్లే చేయలేకపోతోంది.</audio>}
                    {recordingError && <p className="form-error">{recordingError}</p>}
                    {!recordingSupported && <small>రికార్డింగ్‌కు మైక్రోఫోన్ అనుమతి మరియు మద్దతు ఉన్న బ్రౌజర్ అవసరం.</small>}
                  </div>
                  <label>ఫోటో జత చేయండి (ఐచ్ఛికం)
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (event) => {
                      const file = event.currentTarget.files?.[0];
                      if (!file) return;
                      try { setPhotoPreview(await compressImage(file)); } catch (error) { setRecordingError(error instanceof Error ? error.message : "ఫోటోను ప్రాసెస్ చేయలేకపోయాం."); }
                    }} />
                  </label>
                  {photoPreview && <div className="photo-ready">✓ ఫోటో డెమో కోసం కుదించబడింది.</div>}
                  <label>ఫోన్ నంబర్ (ఐచ్ఛికం)
                    <input value={contact} onChange={(event) => setContact(event.target.value)} inputMode="tel" placeholder="ఫోన్ నంబర్" />
                  </label>
                  <p className="privacy-note">గోప్యత: ఇది నమూనా మాత్రమే. నిజమైన సేవ ప్రారంభించే ముందు మీ వివరాలు ఎలా నిల్వ చేస్తారో, ఎవరికి కనిపిస్తాయో స్పష్టంగా తెలియజేయాలి.</p>
                  <button className="button button-dark button-full" type="submit">డెమో ఫిర్యాదును కొనసాగించండి <span>→</span></button>
                </form>
              </>
            ) : (
              <div className="submission-success">
                <span className="success-check">✓</span><span className="section-kicker">డెమో మాత్రమే</span>
                <h2 id="issue-title">నమూనా నంబర్ రూపొందించబడింది</h2>
                <p>ఈ నంబర్ పరీక్ష కోసం మాత్రమే. ఫిర్యాదు ఎక్కడికీ పంపబడలేదు లేదా శాశ్వతంగా నిల్వ చేయబడలేదు.</p>
                <div className="demo-ticket"><small>డెమో ఫిర్యాదు నంబర్</small><b>{issueId}</b></div>
                <button className="button button-dark button-full" onClick={() => { setIssueOpen(false); setSubmitted(false); }}>మూసివేయండి</button>
              </div>
            )}
          </section>
        </div>
      )}

      {trackOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTrackOpen(false); }}>
          <section className="modal modal-small" role="dialog" aria-modal="true" aria-labelledby="track-title">
            <button className="modal-close" aria-label="మూసివేయి" onClick={() => setTrackOpen(false)}>×</button>
            <span className="section-kicker">ఫిర్యాదు అనుసరణ</span><h2 id="track-title">స్థితి తెలుసుకోండి</h2>
            <p className="modal-intro">మీ ఫిర్యాదు నంబర్ నమోదు చేయండి. నిజమైన ట్రాకింగ్ వ్యవస్థ ఇంకా కనెక్ట్ కాలేదు.</p>
            <form className="issue-form" onSubmit={(event) => { event.preventDefault(); setAdminError("ఇది డెమో. ఫిర్యాదుల డేటాబేస్ అనుసంధానం చేసిన తర్వాతే అసలు స్థితి కనిపిస్తుంది."); }}>
              <label>ఫిర్యాదు నంబర్<input value={trackId} onChange={(event) => setTrackId(event.target.value)} placeholder="ఉదా: PV-123456" required /></label>
              <button className="button button-dark button-full" type="submit">వెతకండి</button>
              {adminError && <p className="form-error">{adminError}</p>}
            </form>
          </section>
        </div>
      )}

      {adminOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAdminOpen(false); }}>
          <section className="modal admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">
            <button className="modal-close" aria-label="మూసివేయి" onClick={() => setAdminOpen(false)}>×</button>
            <span className="section-kicker">నిర్వాహక విభాగం</span><h2 id="admin-title">హోమ్‌పేజీ ఫోటోలు</h2>
            {!adminUnlocked ? (
              <>
                <p className="modal-intro">ఈ నమూనాలో ఫోటో అప్‌లోడ్ డెమోను తెరవండి. ఇది నిజమైన భద్రతా లాగిన్ కాదు.</p>
                <form className="issue-form" onSubmit={checkAdmin}>
                  <label>డెమో కోడ్<input type="password" value={adminPin} onChange={(event) => setAdminPin(event.target.value)} placeholder="డెమో కోడ్" /></label>
                  <button className="button button-dark button-full" type="submit">డెమో విభాగం తెరవండి</button>
                  {adminError && <p className="form-error">{adminError}</p>}
                  <small>డెమో కోడ్: <code>demo123</code></small>
                </form>
              </>
            ) : (
              <>
                <p className="modal-intro">ప్రతి ఫోటోను ఎంచుకోండి. అప్‌లోడ్‌కు ముందు చిత్రం 700px గరిష్ఠ పరిమాణానికి కుదించబడుతుంది.</p>
                <div className="admin-portraits">
                  {(Object.keys(portraitLabels) as PortraitKey[]).map((role) => (
                    <ImageSlot key={role} role={role} image={portraits[role]} onUpload={handlePortraitUpload} />
                  ))}
                </div>
                {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
                <div className="admin-warning"><b>ముఖ్య గమనిక:</b> ఈ డెమో ఫోటోలను ఈ బ్రౌజర్‌లో మాత్రమే ఉంచుతుంది. ఇతరులకు కనిపించాలంటే సురక్షితమైన సర్వర్ నిల్వ, అడ్మిన్ లాగిన్, అనుమతులు కలపాలి.</div>
                <button className="button button-outline button-full" onClick={() => { setPortraits(initialPortraits); try { window.localStorage.removeItem("praja-vedika-portraits"); } catch {} setUploadMessage("డెమో ఫోటోలు తొలగించబడ్డాయి."); }}>ఫోటోలను తొలగించండి</button>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
