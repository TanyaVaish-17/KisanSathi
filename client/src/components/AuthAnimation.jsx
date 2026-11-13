import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function AuthAnimation() {
  const [reduced, setReduced] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (reduced || hasError) {
    return (
      <div className="overflow-hidden rounded-panel border border-line-strong bg-white p-3 shadow-none">
        <img
          src="/animations/farmer-app-poster.png"
          alt="A farmer checking crop and queue information on a phone"
          className="mx-auto w-full max-w-[520px] rounded-lg object-cover max-h-[380px]"
        />
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full max-w-[560px]">
      <DotLottieReact
        src="/animations/farmer-app.lottie"
        loop
        autoplay
        onError={() => setHasError(true)}
        className="mx-auto w-full max-w-[540px] max-h-[420px]"
        aria-label="A farmer checking crop and queue information on a phone"
        role="img"
      />
    </div>
  );
}
