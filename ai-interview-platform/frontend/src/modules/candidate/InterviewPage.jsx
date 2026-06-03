import { useState,useEffect,useRef } from "react";
import { useParams,useNavigate } from "react-router-dom";

export default function InterviewPage(){
  const {id}=useParams();
  const navigate=useNavigate();
  const videoRef=useRef(null);

  const steps=[
    {type:"video",text:"Introduce yourself briefly."},
    {type:"mcq",text:"What is React?"},
    {type:"coding",text:"Write a function to reverse a string."}
  ];

  const [step,setStep]=useState(0);
  const [timer,setTimer]=useState(300);
  const [alertSwitch,setAlertSwitch]=useState(false);

  useEffect(()=>{
    const interval=setInterval(()=>{
      if(timer>0) setTimer(timer-1);
      else nextStep();
    },1000);
    return ()=>clearInterval(interval);
  },[timer]);

  useEffect(()=>{
    if(videoRef.current){
      navigator.mediaDevices.getUserMedia({video:true,audio:true})
        .then(stream=>videoRef.current.srcObject=stream)
        .catch(err=>console.error(err));
    }
  },[]);

  useEffect(()=>{
    const blurHandler=()=>setAlertSwitch(true);
    window.addEventListener("blur",blurHandler);
    return ()=>window.removeEventListener("blur",blurHandler);
  },[]);

  const nextStep=()=>{ step<steps.length-1 ? (setStep(step+1),setTimer(300)) : navigate(`/candidate/report/${id}`) }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Interview ID: {id}</h2>
      {alertSwitch && <div className="alert alert-danger text-center">Do not switch tabs!</div>}
      <div className="mb-3 text-center">
        <span className="badge bg-primary p-2">Step {step+1}/{steps.length} | {Math.floor(timer/60)}:{timer%60<10?"0"+timer%60:timer%60}</span>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-lg text-center p-3">
            <h5 className="fw-bold mb-3">Webcam</h5>
            <video ref={videoRef} autoPlay muted className="w-100 rounded" style={{height:"300px",background:"#000"}}/>
            <div className="mt-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Emotion: Confident</span>
                <span>Confidence: 85%</span>
              </div>
              <div className="progress">
                <div className="progress-bar bg-success" style={{width:"85%"}}/>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-lg h-100 p-3">
            <h5 className="fw-bold">{steps[step].type.toUpperCase()} Question</h5>
            <p className="mt-3">{steps[step].text}</p>
            {steps[step].type==="mcq" && (
              <div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="mcq"/>
                  <label className="form-check-label">A. JavaScript Library</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="mcq"/>
                  <label className="form-check-label">B. Database</label>
                </div>
              </div>
            )}
            {steps[step].type==="coding" && <textarea className="form-control mt-3" rows={6} placeholder="Write code here..."/>}
            <button className="btn btn-primary mt-3 w-100" onClick={nextStep}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
