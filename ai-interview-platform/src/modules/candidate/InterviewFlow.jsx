// InterviewFlow.jsx
import { useState } from "react";
import MCQ from "./steps/MCQ";
import Coding from "./steps/Coding";
import Video from "./steps/Video";
import Finish from "./steps/Finish";

export default function InterviewFlow() {
  const [step, setStep] = useState(1);

  return (
    <div className="container mt-4">
      {/* Progress */}
      <div className="progress mb-4">
        <div
          className="progress-bar"
          style={{ width: `${step * 25}%` }}
        >
          Step {step} / 4
        </div>
      </div>

      {step === 1 && <MCQ onNext={() => setStep(2)} />}
      {step === 2 && <Coding onNext={() => setStep(3)} />}
      {step === 3 && <Video onNext={() => setStep(4)} />}
      {step === 4 && <Finish />}
    </div>
  );
}
