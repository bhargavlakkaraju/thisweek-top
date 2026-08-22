"use client";

import { useEffect, useState } from "react";
import { formatCountdownShort } from "@/lib/week";

export function ClaimBar({
  floor,
  resetsAt,
  onClaim,
}: {
  floor: number;
  resetsAt: string;
  onClaim: (price: number) => void;
}) {
  const [price, setPrice] = useState(floor);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    setPrice((p) => Math.max(floor, p));
  }, [floor]);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, new Date(resetsAt).getTime() - Date.now());
      setCountdown(formatCountdownShort(ms));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetsAt]);

  return (
    <div className="claim-bar" id="claim-bar">
      <div className="container claim-bar-inner">
        <div className="claim-left">
          <div className="claim-label">
            Claim <em>#1</em>
          </div>
          <div className="stepper" aria-label="Bid amount stepper">
            <button
              type="button"
              aria-label="Decrease bid"
              disabled={price <= floor}
              onClick={() => setPrice((p) => Math.max(floor, p - 1))}
            >
              −
            </button>
            <div className="price">${price}</div>
            <button
              type="button"
              aria-label="Increase bid"
              onClick={() => setPrice((p) => p + 1)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => onClaim(price)}
          >
            Claim #1 for ${price}
          </button>
        </div>
        <div className="claim-quiet">
          Resets Monday 00:00 UTC · <strong>{countdown}</strong>
        </div>
      </div>
    </div>
  );
}
