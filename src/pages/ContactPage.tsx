// src/pages/ContactPage.tsx

/**
 * File: src/pages/ContactPage.tsx
 *
 * Purpose:
 * Public Spinalith contact page for support, questions, feedback, and general
 * contact submissions.
 *
 * Responsibilities:
 * - Collect visitor name, email, subject, and message.
 * - Require Cloudflare Turnstile verification before submission.
 * - Submit validated form data to the trusted Supabase contact Edge Function.
 * - Display clear success and error states without navigating away.
 *
 * Notes:
 * - Contact submissions are stored in public.contact_messages.
 * - The browser never writes directly to the database.
 * - The Turnstile site key is public and may safely exist in frontend code.
 * - The Turnstile secret remains server-side in Supabase secrets.
 */

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import "../styles/page/contact/contactPage.css";

const TURNSTILE_SITE_KEY = "0x4AAAAAAErWrR3lQCHODgqv";

const CONTACT_FUNCTION_URL =
  "https://nasiludjkymotbqwolix.supabase.co/functions/v1/contact";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action?: string;
      theme?: "light" | "dark" | "auto";
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type ContactFormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactPage() {
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    const scriptId = "cloudflare-turnstile-script";

    const renderWidget = () => {
      if (
        !window.turnstile ||
        !turnstileContainerRef.current ||
        turnstileWidgetIdRef.current
      ) {
        return;
      }

      turnstileWidgetIdRef.current = window.turnstile.render(
        turnstileContainerRef.current,
        {
          sitekey: TURNSTILE_SITE_KEY,
          action: "contact",
          theme: "dark",
          callback: (token) => {
            setTurnstileToken(token);
          },
          "expired-callback": () => {
            setTurnstileToken("");
          },
          "error-callback": () => {
            setTurnstileToken("");
            setStatusType("error");
            setStatusMessage(
              "Verification could not load. Please refresh and try again.",
            );
          },
        },
      );
    };

    const existingScript = document.getElementById(
      scriptId,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.turnstile) {
        renderWidget();
      } else {
        existingScript.addEventListener("load", renderWidget, {
          once: true,
        });
      }

      return;
    }

    const script = document.createElement("script");

    script.id = scriptId;
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderWidget, {
      once: true,
    });

    document.head.appendChild(script);
  }, []);

  function updateField(
    field: keyof ContactFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatusMessage("");
    setStatusType("idle");

    if (!turnstileToken) {
      setStatusType("error");
      setStatusMessage(
        "Please complete the verification before sending your message.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(CONTACT_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          turnstileToken,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Unable to send your message.",
        );
      }

      setForm(initialFormState);
      setTurnstileToken("");
      setStatusType("success");
      setStatusMessage(
        "Your message has been sent. Thanks for reaching out.",
      );

      if (window.turnstile && turnstileWidgetIdRef.current) {
        window.turnstile.reset(turnstileWidgetIdRef.current);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send your message right now.";

      setStatusType("error");
      setStatusMessage(message);

      setTurnstileToken("");

      if (window.turnstile && turnstileWidgetIdRef.current) {
        window.turnstile.reset(turnstileWidgetIdRef.current);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="contact-page">
      <section
        className="contact-hero"
        aria-labelledby="contact-page-title"
      >
        <div className="site-container-narrow">
          <span className="eyebrow">Contact Spinalith</span>

          <h1 id="contact-page-title" className="contact-hero__title">
            Have a question?
            <span> Send us a message.</span>
          </h1>

          <p className="contact-hero__lede">
            Questions, feedback, bug reports, or something else entirely—
            send it our way and we’ll take a look.
          </p>
        </div>
      </section>

      <section className="contact-form-section">
        <div className="site-container-narrow">
          <div className="contact-form-panel">
            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >
              <div className="contact-form__row">
                <label className="contact-form__field">
                  <span>Name</span>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    maxLength={120}
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="contact-form__field">
                  <span>Email</span>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    maxLength={254}
                    autoComplete="email"
                    required
                  />
                </label>
              </div>

              <label className="contact-form__field">
                <span>Subject</span>

                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  maxLength={200}
                  placeholder="What can we help with?"
                />
              </label>

              <label className="contact-form__field">
                <span>Message</span>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  maxLength={10000}
                  rows={8}
                  required
                  placeholder="Tell us what’s going on."
                />
              </label>

              <div className="contact-form__verification">
                <div ref={turnstileContainerRef} />
              </div>

              {statusMessage ? (
                <p
                  className={[
                    "contact-form__status",
                    statusType === "success"
                      ? "contact-form__status--success"
                      : "",
                    statusType === "error"
                      ? "contact-form__status--error"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role={statusType === "error" ? "alert" : "status"}
                >
                  {statusMessage}
                </p>
              ) : null}

              <button
                className="site-button site-button-primary site-button-lg contact-form__submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              <p className="contact-form__note">
                Messages are reviewed directly by Spinalith. We’ll use your
                email only to respond to your request.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}