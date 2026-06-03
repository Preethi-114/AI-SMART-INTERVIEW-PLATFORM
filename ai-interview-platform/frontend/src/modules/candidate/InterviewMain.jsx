// modules/candidate/InterviewPlatform.jsx
// EXACT SAME DESIGN AS YOUR ORIGINAL - with fixed re-record and AI save

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateInterviewApi } from '../services/api';
import BrowserAIService from '../services/browserAIService';

/* ── Speech Recognition ──────────────────────────────────────────────────── */
function useSpeechRecognition() {
  const ref = useRef(null), finalRef = useRef('');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      finalRef.current = '';
      const r = new SR(); 
      r.continuous = true; 
      r.interimResults = true; 
      r.lang = 'en-US';
      r.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) finalRef.current += e.results[i][0].transcript + ' ';
          else interim += e.results[i][0].transcript;
        }
        setTranscript(finalRef.current + interim);
      };
      r.onerror = () => {}; 
      r.onend = () => setIsListening(false);
      r.start(); 
      ref.current = r; 
      setIsListening(true);
    } catch {}
  }, []);
  
  const stop = useCallback(() => {
    if (ref.current) try { ref.current.stop(); } catch {}
    setIsListening(false);
    return finalRef.current.trim();
  }, []);
  
  return { transcript, isListening, startListening: start, stopListening: stop };
}

const fmtClock = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const fmtMM    = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function InterviewPlatform() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();

  /* core */
  const [interview,       setInterview]       = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [step,            setStep]            = useState('instructions');
  const [enabledRounds,   setEnabledRounds]   = useState([]);
  const [completedRounds, setCompletedRounds] = useState({});
  const [timeLeft,        setTimeLeft]        = useState(3600);
  const [candidate,       setCandidate]       = useState({});
  const [liveRecording,   setLiveRecording]   = useState(false);
  const [sessionStarted,  setSessionStarted]  = useState(false);

  /* intro */
  const [introRecording,  setIntroRecording]  = useState(false);
  const [introTime,       setIntroTime]       = useState(0);
  const [introVideoUrl,   setIntroVideoUrl]   = useState(null);
  const [introVideoBlob,  setIntroVideoBlob]  = useState(null);
  const [introDone,       setIntroDone]       = useState(false);
  const [introUploading,  setIntroUploading]  = useState(false);
  const [introAnalyzing,  setIntroAnalyzing]  = useState(false);
  const [introAnalysis,   setIntroAnalysis]   = useState(null);
  const [showReRecordConfirm, setShowReRecordConfirm] = useState(false);

  /* mcq */
  const [mcqQ,       setMcqQ]       = useState([]);
  const [mcqAns,     setMcqAns]     = useState({});
  const [mcqFlagged, setMcqFlagged] = useState({});
  const [mcqTime,    setMcqTime]    = useState({});
  const [mcqIdx,     setMcqIdx]     = useState(0);
  const [mcqSaving,  setMcqSaving]  = useState(false);

  /* coding */
  const [challenges,  setChallenges]  = useState([]);
  const [code,        setCode]        = useState('');
  const [lang,        setLang]        = useState('javascript');
  const [output,      setOutput]      = useState('');
  const [outputError, setOutputError] = useState(false);
  const [running,     setRunning]     = useState(false);
  const [hasRun,      setHasRun]      = useState(false);
  const [codeAI,      setCodeAI]      = useState(null);
  const [codingStartTime, setCodingStartTime] = useState(null);
  const [codingTimeSpent, setCodingTimeSpent] = useState(0);

  /* ui */
  const [viol,        setViol]        = useState({ tab:0, copy:0, resize:0 });
  const [integrity,   setIntegrity]   = useState(100);
  const [toastMsg,    setToastMsg]    = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();
  const videoRef      = useRef(null);
  const mrRef         = useRef(null);
  const chunksRef     = useRef([]);
  const introTimerRef = useRef(null);
  const timerRef      = useRef(null);
  const liveRef       = useRef(false);
  const actLog        = useRef([]);

  useEffect(() => { liveRef.current = liveRecording; }, [liveRecording]);
  useEffect(() => { loadData(); return cleanup; }, []);
  useEffect(() => {
    if (!interview) return;
    const raw = interview.rounds || [];
    const rounds = [];
    if (raw.some(r => /intro|video/i.test(r))) rounds.push('intro');
    if (raw.some(r => /mcq/i.test(r)))         rounds.push('mcq');
    if (raw.some(r => /coding/i.test(r)))       rounds.push('coding');
    if (!rounds.length) {
      const rs = interview.roundSettings || {};
      if (rs.intro?.enabled)  rounds.push('intro');
      if (rs.mcq?.enabled)    rounds.push('mcq');
      if (rs.coding?.enabled) rounds.push('coding');
    }
    setEnabledRounds(rounds);
    setCompletedRounds(Object.fromEntries(rounds.map(r => [r, false])));
  }, [interview]);
  useEffect(() => {
    setIntegrity(Math.max(50, 100 - viol.tab*5 - viol.copy*3 - viol.resize*2));
  }, [viol]);

  // Track coding time
  useEffect(() => {
    if (step === 'coding') {
      setCodingStartTime(Date.now());
      const interval = setInterval(() => {
        if (codingStartTime) {
          setCodingTimeSpent(Math.floor((Date.now() - codingStartTime) / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const cleanup = () => {
    [timerRef, introTimerRef].forEach(r => { if (r.current) clearInterval(r.current); });
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
  };
  const logAct  = (type, detail) => actLog.current.push({ ts: new Date().toISOString(), type, detail });
  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 4000); };
  const logViolation = type => {
    setViol(p => ({ ...p, [type]: (p[type]||0)+1 }));
    logAct('violation', type);
    if (type === 'tab')  showToast('⚠ Tab switching detected and recorded');
    if (type === 'copy') showToast('⚠ Copy/paste is blocked during this interview');
    candidateInterviewApi.saveMetrics(interviewId, { proctoring: { [type === 'tab' ? 'tabSwitch' : 'copyPaste']: true } }).catch(() => {});
  };

  /* ── Load ── */
  const loadData = async () => {
    try {
      const res = await candidateInterviewApi.getInterviewById(interviewId);
      if (res.success) {
        setInterview(res.data);
        setMcqQ(res.data.mcqQuestions || []);
        setChallenges(res.data.codingChallenges || []);
        setTimeLeft((res.data.duration || 60) * 60);
        setCandidate({ name: res.data.candidateName, email: res.data.candidateEmail });
        if (res.data.myStatus === 'completed' || res.data.alreadySubmitted) {
          setStep('already_submitted');
        }
      }
    } finally { setLoading(false); }
  };

  /* ── Camera ── */
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width:{ideal:1280}, height:{ideal:720} },
        audio: { echoCancellation:true, noiseSuppression:true },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      return stream;
    } catch { return null; }
  };

  /* ── Timer ── */
  const startGlobalTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(timerRef.current); doSubmit(); return 0; } return p-1; });
    }, 1000);
  };

  /* ── Proctoring ── */
  const setupProctoring = () => {
    document.addEventListener('visibilitychange', () => { if (document.hidden && liveRef.current) logViolation('tab'); });
    document.addEventListener('contextmenu', e => { if (liveRef.current) { e.preventDefault(); logViolation('copy'); } });
    document.addEventListener('copy', e => { if (liveRef.current && step !== 'coding') { e.preventDefault(); logViolation('copy'); } });
    document.addEventListener('paste', e => { if (liveRef.current && step !== 'coding') { e.preventDefault(); logViolation('copy'); } });
    window.addEventListener('resize', () => { if (liveRef.current) setViol(p => ({ ...p, resize: p.resize+1 })); });
  };

  /* ── Start ── */
  const handleStart = async () => {
    const s = await initCamera();
    if (!s) { showToast('Camera access is required. Please allow camera permissions and reload.'); return; }
    const res = await candidateInterviewApi.startInterview(interviewId);
    if (res.success) {
      setLiveRecording(true); setSessionStarted(true);
      logAct('start', 'Session started'); startGlobalTimer(); setupProctoring();
      setStep(enabledRounds[0] || 'submit');
    }
  };

  /* ── Intro with AI Analysis (FIXED) ── */
  const beginIntroRecording = () => {
    const stream = videoRef.current?.srcObject;
    if (!stream) { showToast('Camera not ready. Please wait.'); return; }
    chunksRef.current = [];
    setIntroVideoUrl(null);
    setIntroVideoBlob(null);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
    const mr = new MediaRecorder(stream, { mimeType: mime });
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type:'video/webm' });
      const url = URL.createObjectURL(blob);
      setIntroVideoUrl(url);
      setIntroVideoBlob(blob);
      const finalT = stopListening();
      // Don't auto-save on stop - wait for user to click Save
      setIntroTranscriptForSave(finalT || transcript);
    };
    mrRef.current = mr; mr.start(1000);
    setIntroRecording(true); startListening();
    const maxS = (interview?.roundSettings?.intro?.duration || 2) * 60;
    const t0 = Date.now();
    introTimerRef.current = setInterval(() => {
      const el = Math.floor((Date.now()-t0)/1000);
      setIntroTime(el);
      if (el >= maxS) endIntroRecording();
    }, 1000);
    logAct('intro_start', 'Recording started');
  };

  const endIntroRecording = () => {
    if (mrRef.current?.state === 'recording') mrRef.current.stop();
    setIntroRecording(false);
    if (introTimerRef.current) clearInterval(introTimerRef.current);
  };

  const [introTranscriptForSave, setIntroTranscriptForSave] = useState('');

  const saveIntroToServer = async (blob, dur, finalT) => {
    setIntroUploading(true);
    try {
      // 1. Upload video
      const fd = new FormData();
      fd.append('video', blob, 'intro.webm');
      fd.append('duration', String(dur));
      fd.append('transcript', finalT || '');
      await candidateInterviewApi.saveIntroVideo(interviewId, fd);
      logAct('intro_upload', `${dur}s`);
      
      // 2. AI Analysis
      if ((finalT || '').trim().length > 10) {
        setIntroAnalyzing(true);
        const aiResult = await BrowserAIService.analyzeIntroVideo(
          finalT, 
          dur, 
          interview?.jobTitle || 'Software Developer',
          candidate?.name || 'Candidate'
        );
        
        if (aiResult) {
          setIntroAnalysis(aiResult);
          // Save AI scores to backend
          const aiFormData = new FormData();
          aiFormData.append('aiScores', JSON.stringify(aiResult));
          aiFormData.append('transcript', finalT);
          aiFormData.append('duration', String(dur));
          await candidateInterviewApi.saveIntroVideo(interviewId, aiFormData);
          logAct('intro_ai', `Analyzed — Score: ${aiResult.overallScore}`);
          showToast(`✅ AI Analysis complete - Score: ${aiResult.overallScore}%`);
        }
      }
      setIntroDone(true);
      showToast('✅ Introduction saved successfully!');
    } catch(e) { 
      console.warn('Save error:', e);
      showToast('Failed to save. Please try again.');
    } finally { 
      setIntroUploading(false);
      setIntroAnalyzing(false);
    }
  };

  const handleSaveIntro = () => {
    if (introVideoBlob && introTranscriptForSave) {
      saveIntroToServer(introVideoBlob, introTime, introTranscriptForSave);
    } else {
      showToast('Please record your introduction first');
    }
  };

  const handleReRecord = () => setShowReRecordConfirm(true);
  const confirmReRecord = () => {
    setShowReRecordConfirm(false);
    setIntroDone(false);
    setIntroVideoUrl(null);
    setIntroVideoBlob(null);
    setIntroAnalysis(null);
    setIntroTranscriptForSave('');
    beginIntroRecording();
  };

  const findNext = cur => {
    const i = enabledRounds.indexOf(cur);
    for (let j = i+1; j < enabledRounds.length; j++) if (!completedRounds[enabledRounds[j]]) return enabledRounds[j];
    return null;
  };
  const nextFrom = round => { setCompletedRounds(p => ({ ...p, [round]:true })); setStep(findNext(round) || 'submit'); };

  /* ── MCQ ── */
  const pickOption = (qId, optId) => {
    setMcqAns(p => ({ ...p, [qId]: optId }));
    setMcqTime(p => ({ ...p, [qId]: (p[qId]||0)+5 }));
  };
  const finishMCQ = async () => {
    const answers = mcqQ
      .filter(q => mcqAns[q.id] !== undefined)
      .map(q => ({ questionId: q.id, selectedOption: mcqAns[q.id], timeSpent: mcqTime[q.id]||30 }));
    setMcqSaving(true);
    try {
      await candidateInterviewApi.saveMCQAnswers(interviewId, { answers, isPartial:false });
      logAct('mcq_done', `${answers.length}/${mcqQ.length}`);
      nextFrom('mcq');
    } finally { setMcqSaving(false); }
  };

  /* ── Coding ── */
  const runMyCode = async () => {
    if (!code.trim()) { showToast('Write your solution first.'); return; }
    setRunning(true); setOutput('Running on server…'); setOutputError(false);
    try {
      const res = await candidateInterviewApi.runCode(interviewId, { code, language: lang });
      const out = res.data?.output || (res.success ? '(no output)' : 'Server unavailable');
      const isErr = !res.success || !!res.data?.hasError;
      setOutput(out);
      setOutputError(isErr);
      setHasRun(true);
      await candidateInterviewApi.saveCodingProgress(interviewId, {
        challengeId: challenges[0]?.id, code, language: lang, isFinal: false,
        executionResult: { success: !isErr, output: out, error: isErr ? out : '' },
        timeSpent: codingTimeSpent
      });
      logAct('code_run', `lang=${lang} error=${isErr}`);
    } catch(err) {
      setOutput(`Execution server unavailable. Please try again.\n${err?.message||''}`);
      setOutputError(true); setHasRun(true);
    } finally { setRunning(false); }
  };

  const submitCoding = async () => {
    await candidateInterviewApi.saveCodingProgress(interviewId, {
      challengeId: challenges[0]?.id, code, language: lang, isFinal: true,
      timeSpent: codingTimeSpent
    });
    logAct('coding_done', `lang=${lang}, time=${codingTimeSpent}s`);
    nextFrom('coding');
  };

  /* ── Submit ── */
  const doSubmit = async () => {
    setSubmitting(true);
    try {
      await candidateInterviewApi.saveMetrics(interviewId, {
        proctoring: viol,
        behavioral: { activityLog: actLog.current },
      });
      await candidateInterviewApi.submitInterview(interviewId);
      setLiveRecording(false);
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      setStep('done');
    } finally { setSubmitting(false); setShowConfirm(false); }
  };

  const urgent = timeLeft < 300;
  const LANGS  = { javascript:'JavaScript', python:'Python', java:'Java', cpp:'C++' };


  /* ════════════════════════ SPECIAL SCREENS ════════════════════════════════ */

  if (step === 'already_submitted') return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" }}>
      <GS />
      <div style={{ background:'#ffffff', borderRadius:24, padding:'44px 40px', maxWidth:460, width:'90%', textAlign:'center', border:'1px solid #fecaca', boxShadow:'0 32px 64px rgba(0,0,0,.5)' }}>
        <div style={{ fontSize:64, marginBottom:18 }}>🔒</div>
        <h2 style={{ color:'#1e293b', fontSize:24, fontWeight:800, marginBottom:10 }}>Interview Already Submitted</h2>
        <p style={{ color:'#64748b', lineHeight:1.65, marginBottom:28 }}>
          You have already completed this interview. Retaking is not permitted.
          Our team will review your responses and get back to you within 3–5 business days.
        </p>
        <div style={{ background:'rgba(239,68,68,.05)', border:'1px solid rgba(239,68,68,.2)', borderRadius:10, padding:'12px 16px', marginBottom:24 }}>
          <p style={{ color:'#f87171', fontSize:13, margin:0 }}>⚠ This session is locked. No changes can be made.</p>
        </div>
        <button style={BTN.secondary} onClick={() => navigate('/candidate-dashboard')}>← Back to Dashboard</button>
      </div>
    </div>
  );

  if (step === 'done') return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" }}>
      <GS />
      <div style={{ background:'#ffffff', borderRadius:24, padding:'44px 40px', maxWidth:500, width:'90%', textAlign:'center', border:'1px solid #e2e8f0', boxShadow:'0 8px 32px rgba(0,0,0,.08)', boxShadow:'0 32px 64px rgba(0,0,0,.5)' }}>
        <div style={{ fontSize:70, marginBottom:18 }}>🎉</div>
        <h2 style={{ color:'#1e293b', fontSize:26, fontWeight:800, marginBottom:10 }}>Interview Submitted!</h2>
        <p style={{ color:'#64748b', lineHeight:1.65, marginBottom:28 }}>
          Thank you, {candidate.name}. We will review your responses and reach out within 3–5 business days.
        </p>
        <div style={{ background:'#f0fdf4', borderRadius:14, padding:'18px 20px', marginBottom:24, textAlign:'left', border:'1px solid #bbf7d0' }}>
          {completedRounds.intro  && <div style={{ color:'#4ade80', fontSize:13, marginBottom:6 }}>✓  Video introduction — recorded &amp; submitted</div>}
          {completedRounds.mcq    && <div style={{ color:'#4ade80', fontSize:13, marginBottom:6 }}>✓  MCQ test — {Object.keys(mcqAns).length} of {mcqQ.length} questions answered</div>}
          {completedRounds.coding && <div style={{ color:'#4ade80', fontSize:13 }}>✓  Coding challenge — solution submitted</div>}
        </div>
        <button style={{ ...BTN.primary, width:'100%', justifyContent:'center', padding:14 }} onClick={() => navigate('/candidate-dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <GS />
      <div style={{ textAlign:'center' }}>
        <div className="spin-ring" style={{ width:48, height:48, border:'3px solid #e2e8f0', borderTop:'3px solid #6366f1', borderRadius:'50%', margin:'0 auto 16px' }} />
        <p style={{ color:'#64748b', fontSize:12, letterSpacing:'0.12em', fontFamily:'monospace' }}>LOADING INTERVIEW...</p>
      </div>
    </div>
  );

  /* ════════════════════════ MAIN UI - EXACT SAME DESIGN ═══════════════════════════════════ */
  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'DM Sans',sans-serif", color:'#1e293b' }}>
      <GS />

      {/* Toast */}
      {toastMsg && (
        <div className="fade-in" style={{ position:'fixed', top:68, right:20, background:'#f1f5f9', border:'1px solid #ef444450', borderRadius:12, padding:'12px 20px', display:'flex', gap:10, alignItems:'center', color:'#fca5a5', fontSize:13, zIndex:9999, boxShadow:'0 8px 32px rgba(0,0,0,.5)' }}>
          <span style={{ fontSize:18 }}>⚠</span>{toastMsg}
        </div>
      )}

      {/* Re-record confirmation */}
      {showReRecordConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9998, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#ffffff', borderRadius:20, padding:40, maxWidth:400, width:'90%', textAlign:'center' }}>
            <div style={{ fontSize:52, marginBottom:16 }}>🔄</div>
            <h3 style={{ marginBottom:10 }}>Re-record Introduction?</h3>
            <p style={{ color:'#64748b', marginBottom:28 }}>Your current recording will be replaced. This action cannot be undone.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button style={BTN.secondary} onClick={() => setShowReRecordConfirm(false)}>Cancel</button>
              <button style={BTN.danger} onClick={confirmReRecord}>Yes, Re-record</button>
            </div>
          </div>
        </div>
      )}

      {/* Submit confirm */}
      {showConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9998, backdropFilter:'blur(4px)' }}>
          <div className="slide-up" style={{ background:'#ffffff', borderRadius:20, padding:40, maxWidth:400, width:'90%', textAlign:'center', border:'1px solid #e2e8f0', boxShadow:'0 20px 48px rgba(0,0,0,.15)' }}>
            <div style={{ fontSize:52, marginBottom:16 }}>🏁</div>
            <h3 style={{ color:'#1e293b', marginBottom:10 }}>Submit Interview?</h3>
            <p style={{ color:'#64748b', fontSize:14, lineHeight:1.65, marginBottom:28 }}>
              Once submitted you cannot make any changes.<br />You will <strong style={{ color:'#f87171' }}>not be able to re-enter</strong> this interview.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button style={BTN.secondary} onClick={() => setShowConfirm(false)}>← Review More</button>
              <button style={BTN.success} onClick={doSubmit} disabled={submitting}>
                {submitting ? '⏳ Submitting...' : '✓ Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{ position:'fixed', top:0, left:0, right:0, height:58, background:'rgba(255,255,255,.97)', backdropFilter:'blur(16px)', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', zIndex:1000 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontWeight:800, fontSize:16, color:'#4f46e5' }}>🧠 InterviewAI Pro</span>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:20, padding:'3px 12px', fontSize:10, color:'#64748b', letterSpacing:'0.08em', fontWeight:700 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:liveRecording?'#22c55e':'#475569', display:'inline-block' }} className={liveRecording?'pulse-dot':''} />
            {sessionStarted ? 'LIVE SESSION' : 'STANDBY'}
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:12, color:'#64748b' }}>{interview?.interviewTitle}</div>
          <div style={{ fontSize:11, color:'#64748b' }}>{candidate.name}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, borderRadius:20, padding:'6px 14px', background:urgent?'#fef2f2':'#eef2ff', border:`1px solid ${urgent?'#fecaca':'#c7d2fe'}` }}>
            <span>{urgent ? '⚡' : '⏱'}</span>
            <span style={{ fontFamily:'monospace', fontWeight:700, color:urgent?'#f87171':'#a5b4fc', fontSize:15, letterSpacing:'0.05em' }}>{fmtClock(timeLeft)}</span>
          </div>
          <div style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:10, padding:'5px 12px', display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontSize:10, color:'#64748b' }}>INTEGRITY</span>
            <span style={{ fontSize:13, fontWeight:800, color:integrity>80?'#22c55e':integrity>60?'#f59e0b':'#ef4444' }}>{integrity}%</span>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ display:'flex', gap:16, padding:'74px 16px 20px', minHeight:'100vh', alignItems:'flex-start' }}>

        {/* SIDEBAR */}
        <aside style={{ width:228, flexShrink:0, display:'flex', flexDirection:'column', gap:12, position:'sticky', top:74 }}>

          {/* Camera */}
          <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 13px', borderBottom:'1px solid #e2e8f0' }}>
              <span style={{ fontSize:10, color:'#64748b', letterSpacing:'0.06em', fontWeight:600 }}>CAMERA</span>
              {liveRecording && <span style={{ fontSize:10, color:'#ef4444', fontWeight:700 }} className="pulse-text">● REC</span>}
            </div>
            <div style={{ position:'relative', background:'#000', aspectRatio:'4/3' }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover', transform:'scaleX(-1)' }} />
              {introRecording && (
                <div style={{ position:'absolute', top:8, right:8, display:'flex', alignItems:'center', gap:5, background:'rgba(239,68,68,.9)', padding:'3px 9px', borderRadius:20 }}>
                  <span className="pulse-dot" style={{ width:6, height:6, borderRadius:'50%', background:'white', display:'inline-block' }} />
                  <span style={{ fontSize:11, color:'white', fontFamily:'monospace', fontWeight:700 }}>{fmtMM(introTime)}</span>
                </div>
              )}
              {introRecording && transcript && (
                <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,.75)', padding:'6px 9px' }}>
                  <span style={{ fontSize:9, color:'#818cf8', display:'block', marginBottom:2 }}>🎤 LIVE</span>
                  <span style={{ fontSize:10, color:'#64748b', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{transcript.slice(-100)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step progress */}
          <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12, padding:'12px 14px' }}>
            <div style={{ fontSize:10, color:'#64748b', letterSpacing:'0.06em', fontWeight:600, marginBottom:10 }}>PROGRESS</div>
            {['instructions', ...enabledRounds, 'submit'].map((r, idx) => {
              const done   = completedRounds[r];
              const active = step === r;
              const names  = { instructions:'Instructions', intro:'Video Intro', mcq:'MCQ Test', coding:'Coding', submit:'Submit' };
              return (
                <div key={r} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom: idx < enabledRounds.length+1 ? '1px solid #e2e8f0' : 'none' }}>
                  <span style={{ fontSize:14, color: done?'#16a34a':active?'#4f46e5':'#d1d5db' }}>
                    {done ? '✓' : active ? '◉' : '○'}
                  </span>
                  <span style={{ fontSize:12, fontWeight:active?700:400, color:active?'#4f46e5':done?'#16a34a':'#64748b' }}>
                    {names[r]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Proctoring panel */}
          {sessionStarted && (
            <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12, padding:'12px 14px' }}>
              <div style={{ fontSize:10, color:'#64748b', letterSpacing:'0.06em', fontWeight:600, marginBottom:10 }}>PROCTORING</div>
              {[
                { label:'Tab switches', val:viol.tab,    warn: viol.tab > 2 },
                { label:'Copy/paste',   val:viol.copy,   warn: viol.copy > 0 },
                { label:'Resizes',      val:viol.resize, warn: false },
              ].map(({ label, val, warn }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:11, color:'#64748b' }}>{label}</span>
                  <span style={{ fontSize:11, fontWeight:700, color: warn?'#f87171':'#4ade80' }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main style={{ flex:1, minWidth:0 }}>

          {/* ── INSTRUCTIONS ── */}
          {step === 'instructions' && (
            <div style={CARD}>
              <div style={CARD_HEAD}>
                <span style={{ fontSize:28 }}>📋</span>
                <div style={{ flex:1 }}>
                  <h2 style={CARD_TITLE}>{interview?.interviewTitle}</h2>
                  <p style={CARD_SUB}>{interview?.department} · {interview?.duration||60} minutes total</p>
                </div>
              </div>
              <div style={{ padding:'20px 24px 28px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
                  {enabledRounds.includes('intro') && (
                    <div style={TILE}>
                      <span style={{ fontSize:32 }}>🎥</span>
                      <div style={{ fontSize:13, fontWeight:600, color:'#475569' }}>Video Intro</div>
                      <div style={{ fontSize:11, color:'#64748b', textAlign:'center' }}>Record a {interview?.roundSettings?.intro?.duration||2}-min introduction</div>
                    </div>
                  )}
                  {enabledRounds.includes('mcq') && (
                    <div style={TILE}>
                      <span style={{ fontSize:32 }}>📝</span>
                      <div style={{ fontSize:13, fontWeight:600, color:'#475569' }}>MCQ Assessment</div>
                      <div style={{ fontSize:11, color:'#64748b', textAlign:'center' }}>{mcqQ.length} questions — choose best answer</div>
                    </div>
                  )}
                  {enabledRounds.includes('coding') && (
                    <div style={TILE}>
                      <span style={{ fontSize:32 }}>💻</span>
                      <div style={{ fontSize:13, fontWeight:600, color:'#475569' }}>Coding Challenge</div>
                      <div style={{ fontSize:11, color:'#64748b', textAlign:'center' }}>{challenges.length} challenge — write &amp; run your solution</div>
                    </div>
                  )}
                </div>
                <div style={{ background:'rgba(239,68,68,.05)', border:'1px solid rgba(239,68,68,.15)', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
                  <p style={{ color:'#fca5a5', fontSize:13, margin:0 }}>
                    ⚠ Keep this tab open. No copy/paste. Tab switches are recorded.
                    Once submitted you <strong>cannot</strong> re-enter this interview.
                  </p>
                </div>
                <div style={{ background:'rgba(99,102,241,.05)', border:'1px solid rgba(99,102,241,.15)', borderRadius:10, padding:'12px 16px', marginBottom:24 }}>
                  <p style={{ color:'#a5b4fc', fontSize:13, margin:0 }}>
                    🎥 Clicking "Start" will request camera &amp; microphone access. Please allow it.
                  </p>
                </div>
                <button style={{ ...BTN.primary, width:'100%', justifyContent:'center', padding:14, fontSize:15 }} onClick={handleStart}>
                  ▶ Start Interview
                </button>
              </div>
            </div>
          )}

          {/* ── INTRO with AI Analysis Status (FIXED SAVE BUTTON) ── */}
          {step === 'intro' && (
            <div style={CARD}>
              <div style={CARD_HEAD}>
                <span style={{ fontSize:28 }}>🎥</span>
                <div style={{ flex:1 }}>
                  <h2 style={CARD_TITLE}>Video Introduction</h2>
                  <p style={CARD_SUB}>Record up to {interview?.roundSettings?.intro?.duration||2} minutes — introduce yourself and your experience</p>
                </div>
                {introRecording && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:20, padding:'5px 14px' }}>
                    <span className="pulse-dot" style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444', display:'inline-block' }} />
                    <span style={{ fontFamily:'monospace', fontWeight:700, color:'#f87171', fontSize:14 }}>{fmtMM(introTime)}</span>
                  </div>
                )}
              </div>
              <div style={{ padding:'20px 24px 28px' }}>

                {/* Playback */}
                {introVideoUrl && !introRecording && (
                  <div style={{ marginBottom:16, borderRadius:12, overflow:'hidden', background:'#000' }}>
                    <video src={introVideoUrl} controls style={{ width:'100%', maxHeight:260, display:'block' }} />
                  </div>
                )}

                {/* AI Analysis Result Badge */}
                {introAnalysis && !introRecording && introDone && (
                  <div style={{ marginBottom:16, padding:'12px 16px', background:'rgba(79,70,229,.1)', borderRadius:10, border:'1px solid rgba(79,70,229,.2)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <span style={{ fontSize:24 }}>🤖</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#4f46e5' }}>AI Analysis Complete</div>
                        <div style={{ fontSize:12, color:'#64748b' }}>Score: {introAnalysis.overallScore}% · {introAnalysis.sentiment} sentiment</div>
                        <div style={{ fontSize:11, color:'#8b5cf6', marginTop:4 }}>{introAnalysis.keyStrengths?.slice(0,2).join(' · ')}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transcript Preview (temporary - will hide later) */}
                {introTranscriptForSave && !introRecording && !introDone && (
                  <div style={{ marginBottom:16, padding:'12px 16px', background:'#f1f5f9', borderRadius:10, fontSize:12, color:'#475569' }}>
                    <strong>📝 Transcript Preview:</strong> {introTranscriptForSave.slice(0, 150)}...
                  </div>
                )}

                {/* Upload/analyze status */}
                {(introUploading || introAnalyzing) && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 15px', background:'#f1f5f9', borderRadius:10, marginBottom:16, border:'1px solid #6366f125' }}>
                    <div className="spin-ring" style={{ width:15, height:15, border:'2px solid #e2e8f0', borderTop:'2px solid #6366f1', borderRadius:'50%' }} />
                    <span style={{ fontSize:13, color:'#64748b' }}>
                      {introUploading ? 'Uploading your recording securely...' : 'AI is analyzing your introduction...'}
                    </span>
                  </div>
                )}

                {/* Success message */}
                {introDone && !introUploading && !introAnalyzing && (
                  <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'rgba(34,197,94,.07)', border:'1px solid rgba(34,197,94,.2)', borderRadius:10, marginBottom:16 }}>
                    <span style={{ fontSize:22 }}>✅</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#4ade80' }}>Introduction recorded &amp; analyzed with AI</div>
                      <div style={{ fontSize:12, color:'#64748b' }}>Your response has been securely saved for review.</div>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {!introDone && (
                  <div style={{ background:'rgba(99,102,241,.06)', border:'1px solid rgba(99,102,241,.12)', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
                    <p style={{ color:'#a5b4fc', fontSize:13, margin:0 }}>
                      💡 Speak clearly about your background, skills, and why you're a good fit. Keep it under {interview?.roundSettings?.intro?.duration||2} minutes.
                    </p>
                  </div>
                )}

                <div style={{ display:'flex', gap:12 }}>
                  {!introDone && !introRecording && !introVideoUrl && (
                    <button style={BTN.danger} onClick={beginIntroRecording}>● Start Recording</button>
                  )}
                  {introRecording && (
                    <button style={{ ...BTN.secondary, borderColor:'#f59e0b40', color:'#f59e0b' }} onClick={endIntroRecording}>■ Stop Recording</button>
                  )}
                  {introVideoUrl && !introRecording && !introDone && (
                    <>
                      <button style={BTN.primary} onClick={handleSaveIntro}>
                        💾 Save & Continue
                      </button>
                      <button style={BTN.secondary} onClick={handleReRecord}>🔄 Re-record</button>
                    </>
                  )}
                  {introDone && !introUploading && !introAnalyzing && (
                    <button style={BTN.primary} onClick={() => nextFrom('intro')}>
                      Continue → {enabledRounds.includes('mcq')?'MCQ Test':enabledRounds.includes('coding')?'Coding':'Submit'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MCQ ── */}
          {step === 'mcq' && (
            <div style={CARD}>
              <div style={CARD_HEAD}>
                <span style={{ fontSize:28 }}>📝</span>
                <div style={{ flex:1 }}>
                  <h2 style={CARD_TITLE}>Multiple Choice Questions</h2>
                  <p style={CARD_SUB}>{Object.keys(mcqAns).length} of {mcqQ.length} answered · {Object.values(mcqFlagged).filter(Boolean).length} flagged</p>
                </div>
                <div style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:10, padding:'6px 14px', fontFamily:'monospace', fontWeight:700, color:'#64748b', fontSize:14 }}>{mcqIdx+1} / {mcqQ.length}</div>
              </div>
              <div style={{ padding:'20px 24px 28px' }}>
                <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
                  {mcqQ.map((q, i) => {
                    const answered = mcqAns[q.id] !== undefined;
                    const flagged  = mcqFlagged[q.id];
                    const active   = i === mcqIdx;
                    return (
                      <button key={q.id} onClick={() => setMcqIdx(i)} style={{ width:33, height:33, borderRadius:8, border:`1.5px solid ${active?'#6366f1':answered?'#22c55e':flagged?'#f59e0b':'#e2e8f0'}`, background:active?'#6366f1':answered?'#22c55e15':'#f1f5f9', color:active?'white':answered?'#4ade80':flagged?'#fbbf24':'#64748b', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        {i+1}
                      </button>
                    );
                  })}
                </div>

                {mcqQ[mcqIdx] && (() => {
                  const q = mcqQ[mcqIdx];
                  return (
                    <>
                      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                        <span style={{ background:'#3b82f615', border:'1px solid #3b82f630', color:'#60a5fa', fontSize:11, padding:'3px 10px', borderRadius:6, fontWeight:600 }}>{q.category}</span>
                        <span style={{ background:q.difficulty==='Easy'?'#22c55e15':q.difficulty==='Hard'?'#ef444415':'#f59e0b15', border:`1px solid ${q.difficulty==='Easy'?'#22c55e30':q.difficulty==='Hard'?'#ef444430':'#f59e0b30'}`, color:q.difficulty==='Easy'?'#4ade80':q.difficulty==='Hard'?'#f87171':'#fbbf24', fontSize:11, padding:'3px 10px', borderRadius:6, fontWeight:600 }}>{q.difficulty}</span>
                        {mcqFlagged[q.id] && <span style={{ background:'#f59e0b15', border:'1px solid #f59e0b30', color:'#fbbf24', fontSize:11, padding:'3px 10px', borderRadius:6 }}>🚩 Flagged</span>}
                      </div>
                      <div style={{ fontSize:16, color:'#475569', lineHeight:1.7, padding:'15px 18px', background:'#f1f5f9', borderRadius:12, border:'1px solid #e2e8f0', marginBottom:16 }}>{q.question}</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:22 }}>
                        {q.options.map((opt, i) => {
                          const sel = mcqAns[q.id] === opt.id;
                          return (
                            <button key={opt.id} onClick={() => pickOption(q.id, opt.id)} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:12, background:sel?'#6366f115':'#ffffff', border:`1.5px solid ${sel?'#6366f1':'#e2e8f0'}`, cursor:'pointer', transition:'all .15s', transform:sel?'translateX(4px)':'none', textAlign:'left', width:'100%' }}>
                              <span style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, background:sel?'#6366f1':'#f1f5f9', color:sel?'white':'#475569', flexShrink:0 }}>{String.fromCharCode(65+i)}</span>
                              <span style={{ color:sel?'#4f46e5':'#374151', flex:1, fontSize:14 }}>{opt.text}</span>
                              {sel && <span style={{ color:'#818cf8', fontWeight:700 }}>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <button onClick={() => setMcqFlagged(p => ({ ...p, [q.id]:!p[q.id] }))} style={{ background:'none', border:`1px solid ${mcqFlagged[q.id]?'#f59e0b':'#e2e8f0'}`, borderRadius:8, padding:'7px 14px', color:mcqFlagged[q.id]?'#fbbf24':'#64748b', cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
                          🚩 {mcqFlagged[q.id] ? 'Unflag' : 'Flag for Review'}
                        </button>
                        <div style={{ display:'flex', gap:10 }}>
                          <button style={BTN.secondary} onClick={() => setMcqIdx(p => Math.max(0,p-1))} disabled={mcqIdx===0}>← Prev</button>
                          {mcqIdx < mcqQ.length-1
                            ? <button style={BTN.primary} onClick={() => setMcqIdx(p => p+1)}>Next →</button>
                            : <button style={BTN.success} onClick={finishMCQ} disabled={mcqSaving}>{mcqSaving ? '⏳ Saving...' : '✓ Finish MCQ'}</button>}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ── CODING ── */}
          {step === 'coding' && (
            <div style={{ ...CARD, maxHeight:'calc(100vh - 90px)', display:'flex', flexDirection:'column' }}>
              <div style={CARD_HEAD}>
                <span style={{ fontSize:28 }}>💻</span>
                <div style={{ flex:1 }}>
                  <h2 style={CARD_TITLE}>Coding Challenge</h2>
                  <p style={CARD_SUB}>Write your solution, run it to verify, then submit</p>
                </div>
                {challenges[0] && (
                  <span style={{ background:'#f59e0b15', border:'1px solid #f59e0b30', color:'#fbbf24', fontSize:12, padding:'4px 12px', borderRadius:8, fontWeight:600 }}>{challenges[0].difficulty}</span>
                )}
                {codingTimeSpent > 0 && (
                  <span style={{ background:'#6366f115', border:'1px solid #6366f130', color:'#818cf8', fontSize:11, padding:'4px 10px', borderRadius:8 }}>⏱ Time: {Math.floor(codingTimeSpent/60)}m {codingTimeSpent%60}s</span>
                )}
              </div>
              <div style={{ padding:'20px 24px 28px', overflowY:'auto', flex:1 }}>
                {challenges[0] && (
                  <div style={{ background:'#f8fafc', borderRadius:12, padding:'16px 18px', marginBottom:16, border:'1px solid #e2e8f0' }}>
                    <h3 style={{ color:'#4f46e5', fontWeight:700, marginBottom:10, fontSize:16 }}>{challenges[0].title}</h3>
                    <pre style={{ color:'#64748b', fontSize:13, lineHeight:1.75, whiteSpace:'pre-wrap', fontFamily:'inherit', margin:0 }}>{challenges[0].description}</pre>
                  </div>
                )}

                <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                  {Object.entries(LANGS).map(([key, name]) => (
                    <button key={key} onClick={() => { setLang(key); setCode(''); setOutput(''); setHasRun(false); setCodeAI(null); }} style={{ padding:'5px 14px', borderRadius:8, border:`1px solid ${lang===key?'#6366f1':'#e2e8f0'}`, background:lang===key?'#eef2ff':'#ffffff', color:lang===key?'#a5b4fc':'#64748b', fontSize:12, cursor:'pointer', fontWeight:lang===key?700:400, fontFamily:'inherit' }}>{name}</button>
                  ))}
                </div>

                <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden', marginBottom:12 }}>
                  <div style={{ background:'#f1f5f9', padding:'8px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e2e8f0' }}>
                    <span style={{ fontSize:12, color:'#64748b', fontFamily:'monospace' }}>{LANGS[lang]}</span>
                    <button onClick={() => { setCode(''); setOutput(''); setHasRun(false); setCodeAI(null); }} style={{ background:'none', border:'none', color:'#64748b', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Clear</button>
                  </div>
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    onCopy={e => { e.preventDefault(); logViolation('copy'); }}
                    onPaste={e => { e.preventDefault(); logViolation('copy'); }}
                    spellCheck={false}
                    placeholder={`// Write your ${LANGS[lang]} solution here...\n`}
                    style={{ width:'100%', minHeight:260, padding:'14px 16px', background:'#fafafa', color:'#1e293b', fontFamily:"'JetBrains Mono','Cascadia Code',Consolas,monospace", fontSize:13, lineHeight:1.7, border:'none', resize:'vertical', display:'block' }}
                  />
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
                  <button style={{ ...BTN.success, opacity:running?0.75:1 }} onClick={runMyCode} disabled={running}>
                    {running ? '⏳ Running...' : '▶ Run Code'}
                  </button>
                  <span style={{ fontSize:12, color:'#64748b' }}>Executes on a real server — errors show exactly as they are</span>
                </div>

                <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, overflow:'hidden', marginBottom:14 }}>
                  <div style={{ background:'#f1f5f9', padding:'7px 14px', display:'flex', justifyContent:'space-between', borderBottom:'1px solid #e2e8f0' }}>
                    <span style={{ fontSize:11, color:'#64748b', letterSpacing:'0.06em', fontFamily:'monospace' }}>▸ OUTPUT</span>
                    {hasRun && <span style={{ fontSize:11, fontWeight:700, color:outputError?'#f87171':'#4ade80' }}>{outputError ? '✗ Error' : '✓ Success'}</span>}
                  </div>
                  <pre style={{ padding:'12px 16px', color: outputError?'#dc2626':'#166534', background: outputError?'#fef2f2':'#f0fdf4', fontFamily:"'JetBrains Mono',monospace", fontSize:12, minHeight:80, maxHeight:200, overflowY:'auto', whiteSpace:'pre-wrap', margin:0 }}>
                    {output || 'Click "Run Code" to see your output...'}
                  </pre>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:4, borderTop:'1px solid #e2e8f0' }}>
                  <span style={{ fontSize:12, color:'#64748b' }}>
                    💡 You can submit even if your code has errors — just do your best.
                  </span>
                  <button style={BTN.primary} onClick={submitCoding}>
                    Submit Solution → {findNext('coding') ? findNext('coding').charAt(0).toUpperCase()+findNext('coding').slice(1) : 'Finish'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SUBMIT ── */}
          {step === 'submit' && (
            <div style={CARD}>
              <div style={CARD_HEAD}>
                <span style={{ fontSize:28 }}>🏁</span>
                <div>
                  <h2 style={CARD_TITLE}>Ready to Submit</h2>
                  <p style={CARD_SUB}>Review completed sections before final submission</p>
                </div>
              </div>
              <div style={{ padding:'20px 24px 28px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
                  {enabledRounds.includes('intro') && (
                    <div style={{ ...TILE, border:`1px solid ${completedRounds.intro?'#22c55e':'#e2e8f0'}` }}>
                      <span style={{ fontSize:32 }}>🎥</span>
                      <div style={{ fontSize:13, fontWeight:600, color:'#475569' }}>Video Intro</div>
                      <div style={{ fontSize:12, fontWeight:700, color:completedRounds.intro?'#4ade80':'#64748b' }}>{completedRounds.intro?'✓ Recorded & AI Analyzed':'○ Not started'}</div>
                    </div>
                  )}
                  {enabledRounds.includes('mcq') && (
                    <div style={{ ...TILE, border:`1px solid ${completedRounds.mcq?'#22c55e':'#e2e8f0'}` }}>
                      <span style={{ fontSize:32 }}>📝</span>
                      <div style={{ fontSize:13, fontWeight:600, color:'#475569' }}>MCQ Test</div>
                      <div style={{ fontSize:12, fontWeight:700, color:completedRounds.mcq?`✓ ${Object.keys(mcqAns).length}/${mcqQ.length}`:'○ Not started' }}>{completedRounds.mcq?`✓ ${Object.keys(mcqAns).length}/${mcqQ.length}`:'○ Not started'}</div>
                    </div>
                  )}
                  {enabledRounds.includes('coding') && (
                    <div style={{ ...TILE, border:`1px solid ${completedRounds.coding?'#22c55e':'#e2e8f0'}` }}>
                      <span style={{ fontSize:32 }}>💻</span>
                      <div style={{ fontSize:13, fontWeight:600, color:'#475569' }}>Coding</div>
                      <div style={{ fontSize:12, fontWeight:700, color:completedRounds.coding?'#4ade80':'#64748b' }}>{completedRounds.coding?'✓ Submitted':'○ Not started'}</div>
                    </div>
                  )}
                  <div style={{ ...TILE, border:`1px solid ${urgent?'#fecaca':'#e2e8f0'}` }}>
                    <span style={{ fontSize:32 }}>⏱</span>
                    <div style={{ fontSize:13, fontWeight:600, color:'#475569' }}>Time Left</div>
                    <div style={{ fontSize:12, fontWeight:700, color:urgent?'#f87171':'#94a3b8', fontFamily:'monospace' }}>{fmtClock(timeLeft)}</div>
                  </div>
                </div>
                <div style={{ background:'rgba(239,68,68,.05)', border:'1px solid rgba(239,68,68,.15)', borderRadius:10, padding:'12px 16px', marginBottom:24 }}>
                  <p style={{ color:'#fca5a5', fontSize:13, margin:0 }}>
                    ⚠ Submission is <strong>final</strong> — no changes allowed afterward.
                    You will <strong>not be able to re-enter</strong> this interview.
                  </p>
                </div>
                <div style={{ display:'flex', gap:14, justifyContent:'center' }}>
                  <button style={BTN.secondary} onClick={() => setStep(enabledRounds[enabledRounds.length-1]||'instructions')}>← Review Answers</button>
                  <button style={{ ...BTN.primary, padding:'14px 36px', fontSize:15 }} onClick={() => setShowConfirm(true)}>Submit Interview 🚀</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// ── Style constants (EXACT SAME AS YOUR ORIGINAL) ───────────────────────────────────────────
const CARD      = { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:16, overflow:'hidden' };
const CARD_HEAD = { display:'flex', alignItems:'center', gap:16, padding:'18px 24px', borderBottom:'1px solid #e2e8f0', background:'linear-gradient(135deg,#f8fafc,#f1f5f9)' };
const CARD_TITLE = { fontSize:18, fontWeight:700, color:'#1e293b', marginBottom:3 };
const CARD_SUB   = { fontSize:12, color:'#64748b', margin:0 };
const TILE = { background:'#f1f5f9', borderRadius:14, padding:'18px 14px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:8 };
const BTN = {
  primary:   { display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', border:'none', borderRadius:10, padding:'11px 22px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  secondary: { display:'inline-flex', alignItems:'center', gap:8, background:'transparent', color:'#64748b', border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 20px', fontSize:13, cursor:'pointer', fontFamily:'inherit' },
  success:   { display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', border:'none', borderRadius:10, padding:'11px 22px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  danger:    { display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'white', border:'none', borderRadius:10, padding:'11px 22px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
};

// ── Global CSS (EXACT SAME AS YOUR ORIGINAL) ────────────────────────────────────────────────
function GS() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
      *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
      body { font-family:'DM Sans',-apple-system,sans-serif; background:#f8fafc; }
      @keyframes spin  { to { transform:rotate(360deg); } }
      @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
      @keyframes fade-in  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      .spin-ring  { animation:spin .8s linear infinite; }
      .pulse-dot  { animation:pulse 1.5s infinite; }
      .pulse-text { animation:pulse 1.5s infinite; }
      .fade-in    { animation:fade-in .2s ease; }
      .slide-up   { animation:slide-up .2s ease; }
      ::-webkit-scrollbar { width:4px; height:4px; }
      ::-webkit-scrollbar-track { background:#f1f5f9; }
      ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:2px; }
      textarea,pre,code { font-family:'JetBrains Mono','Cascadia Code',Consolas,monospace !important; }
      button,input { font-family:'DM Sans',sans-serif; }
      textarea:focus,input:focus,button:focus { outline:none; }
      button:disabled { opacity:.6; cursor:not-allowed; }
    `}</style>
  );
}