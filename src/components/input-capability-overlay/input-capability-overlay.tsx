import { useEffect, useState } from "react";
import "./input-capability-overlay.scss";

interface DeviceCapability {
  isTouchOnly: boolean;
  isSmallScreen: boolean;
}

const MIN_WIDTH = 900; // pixels
const MIN_HEIGHT = 600; // pixels

/**
 * Detects device input capabilities using CSS media queries.
 * Returns true if device is touch-only (coarse pointer, no fine pointer).
 */
function detectTouchOnly(): boolean {
  // Check if fine pointer (mouse/trackpad) is available
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  // Check if only coarse pointer (touch) is available
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const noFinePointer = !hasFinePointer;

  // Touch-only means: has coarse input AND does NOT have fine input
  return hasCoarsePointer && noFinePointer;
}

/**
 * Detects if viewport is below recommended minimums.
 */
function detectSmallScreen(): boolean {
  return window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT;
}

/**
 * Queries device capabilities using only CSS media queries and viewport size.
 * No user-agent sniffing.
 */
function detectDeviceCapability(): DeviceCapability {
  return {
    isTouchOnly: detectTouchOnly(),
    isSmallScreen: detectSmallScreen(),
  };
}

export default function InputCapabilityOverlay() {
  const [capability, setCapability] = useState<DeviceCapability>(() =>
    detectDeviceCapability()
  );

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      setCapability(detectDeviceCapability());
    };

    // Handle media query changes (device rotation, pointer capability changes)
    const finePointerMQ = window.matchMedia("(pointer: fine)");
    const coarsePointerMQ = window.matchMedia("(pointer: coarse)");

    const handleMediaChange = () => {
      setCapability(detectDeviceCapability());
    };

    window.addEventListener("resize", handleResize);
    finePointerMQ.addEventListener("change", handleMediaChange);
    coarsePointerMQ.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      finePointerMQ.removeEventListener("change", handleMediaChange);
      coarsePointerMQ.removeEventListener("change", handleMediaChange);
    };
  }, []);

  // Touch-only is blocking; small screen is non-blocking
  if (capability.isTouchOnly) {
    return (
      <div className="input-capability-overlay input-capability-blocking">
        <div className="input-capability-backdrop" />
        <div className="input-capability-card">
          <h1 className="input-capability-heading">Unsupported Device</h1>
          <p className="input-capability-message">
            <span>Touch input is not supported yet.</span>
            <br />
            <span>BLITZ requires a mouse and keyboard.</span>
          </p>

          <p className="input-capability-subtext">
            Please access BLITZ from a desktop or laptop computer.
          </p>
        </div>
      </div>
    );
  }

  // Non-blocking warning for small screens
  if (capability.isSmallScreen) {
    return (
      <div className="input-capability-overlay input-capability-warning">
        <div className="input-capability-backdrop" />
        <div className="input-capability-card input-capability-card-warning">
          <h2 className="input-capability-heading">Screen Size Warning</h2>
          <p className="input-capability-message">
            This screen size may not provide the best experience.
          </p>
          <p className="input-capability-subtext">
            For optimal performance, use a larger screen.
          </p>
        </div>
      </div>
    );
  }

  // Device is supported
  return null;
}
