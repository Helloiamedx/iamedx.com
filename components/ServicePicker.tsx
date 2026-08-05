"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClickSpark } from "@/components/ClickSpark";
import { currency, services, type Service } from "@/content/services";

function formatPrice(service: Service) {
  const amount =
    typeof service.price === "number" ? service.price : service.price.from;
  const prefix = typeof service.price === "number" ? "" : "from ";
  return `${prefix}${currency} ${amount}`;
}

export function ServicePicker() {
  const [selected, setSelected] = useState<string[]>([]);

  const selectedServices = useMemo(
    () => services.filter((service) => selected.includes(service.id)),
    [selected],
  );

  const total = selectedServices.reduce((sum, service) => {
    const amount =
      typeof service.price === "number" ? service.price : service.price.from;
    return sum + amount;
  }, 0);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  const inquireHref =
    selected.length > 0
      ? `/contact?services=${selected.join(",")}`
      : "/contact";

  return (
    <div className="service-picker">
      <ul className="service-list">
        {services
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((service) => {
            const checked = selected.includes(service.id);
            return (
              <li key={service.id}>
                <label className={checked ? "is-selected" : undefined}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(service.id)}
                  />
                  <span>
                    <strong>{service.title}</strong>
                    <em>{formatPrice(service)}</em>
                    <p>{service.summary}</p>
                  </span>
                </label>
              </li>
            );
          })}
      </ul>

      <aside className="service-summary">
        <h2>Selected</h2>
        {selectedServices.length === 0 ? (
          <p>Choose the stages you need.</p>
        ) : (
          <ul>
            {selectedServices.map((service) => (
              <li key={service.id}>
                {service.title}
                <span>{formatPrice(service)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="service-summary__total">
          Estimated total: {currency} {total}
        </p>
        <ClickSpark>
          <Link href={inquireHref} className="button">
            Inquire about selected services
          </Link>
        </ClickSpark>
      </aside>
    </div>
  );
}
