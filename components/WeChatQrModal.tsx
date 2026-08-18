"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { weChatCta, weChatId, weChatQrSrc } from "@/content/nav";

type WeChatQrModalProps = {
  className?: string;
  children: ReactNode;
};

export function WeChatQrModal({ className, children }: WeChatQrModalProps) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setLoaded(false);
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      {mounted && open
        ? createPortal(
            <div className="wechat-qr" role="presentation">
              <button
                type="button"
                className="wechat-qr__backdrop"
                aria-label="Close WeChat"
                onClick={() => setOpen(false)}
              />
              <div
                className="wechat-qr__window"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
              >
                <p id={titleId} className="wechat-qr__title">
                  {weChatCta.label}
                </p>
                <div className={`wechat-qr__frame${loaded ? " is-loaded" : ""}`}>
                  {/* Swap weChatQrSrc when the real QR photo arrives */}
                  <img
                    src={weChatQrSrc}
                    alt={`${weChatId} WeChat QR code`}
                    onLoad={() => setLoaded(true)}
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
