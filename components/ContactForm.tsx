"use client";

import { useState, type FormEvent } from "react";
import { ClickSpark } from "@/components/ClickSpark";

type ContactFormProps = {
  presetMessage?: string;
};

export function ContactForm({ presetMessage = "" }: ContactFormProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState(presetMessage);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(`Inquiry from ${name || "website"}`);
    const body = encodeURIComponent(
      [`Name: ${name || "(not provided)"}`, "", message].join("\n"),
    );
    window.location.href = `mailto:hello@iamedx.com?subject=${subject}&body=${body}`;
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label>
        Name
        <input
          type="text"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
        />
      </label>
      <label>
        Message
        <textarea
          name="message"
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
      </label>
      <ClickSpark>
        <button type="submit" className="button">
          Open email to hello@iamedx.com
        </button>
      </ClickSpark>
    </form>
  );
}
