"use client";

import { useState, type FormEvent } from "react";
import { OriginButton } from "@/components/ui/origin-button";
import { contactInfo } from "@/content/nav";

function buildMailto(email: string, message: string) {
  const subject = "Get in touch · iamedx.com";
  const body = [`From: ${email.trim()}`, "", message.trim()].join("\n");
  const params = new URLSearchParams({ subject, body });
  return `${contactInfo.emailHref}?${params.toString()}`;
}

/** Always-visible footer mid form — opens the visitor’s mail app via mailto. */
export function FooterContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !message.trim()) return;
    window.location.href = buildMailto(email, message);
  };

  return (
    <div className="footer-contact-beam">
      <div className="footer-contact site-footer__panel">
        <h2 className="footer-contact__title">Get in touch</h2>
        <form className="footer-contact__form" onSubmit={onSubmit}>
          <label className="footer-contact__label" htmlFor="footer-contact-email">
            Your email
          </label>
          <input
            id="footer-contact-email"
            className="footer-contact__input"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label
            className="footer-contact__label"
            htmlFor="footer-contact-message"
          >
            Your request
          </label>
          <textarea
            id="footer-contact-message"
            className="footer-contact__textarea"
            required
            rows={4}
            placeholder="What do you need help with?"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="footer-contact__submit">
            <OriginButton type="submit">Send request</OriginButton>
          </div>
        </form>
      </div>
    </div>
  );
}
