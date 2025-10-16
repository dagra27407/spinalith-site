import { Container } from "./layout";

export default function BandSection({
  children,
  id,
  bandClass = "bg-zinc-50",
  panel = false,
}: {
  children: React.ReactNode;
  id?: string;
  bandClass?: string; // color of the side bands
  panel?: boolean;    // true = white floating card
}) {
  return (
    <section id={id} className="relative py-20 sm:py-24">
      {/* SIDE BANDS */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0">
        {/* left band */}
        <div
          className={`hidden md:block absolute inset-y-0 left-0 ${bandClass}`}
          style={{ width: "max(calc((100vw - 72rem)/2), 1rem)" }}
        />
        {/* right band */}
        <div
          className={`hidden md:block absolute inset-y-0 right-0 ${bandClass}`}
          style={{ width: "max(calc((100vw - 72rem)/2), 1rem)" }}
        />
      </div>

      {/* CENTER CONTENT */}
      <Container>
        {panel ? (
          <div className="mx-auto max-w-3xl rounded-2xl border bg-white/95 shadow-sm backdrop-blur px-6 py-10">
            {children}
          </div>
        ) : (
          children
        )}
      </Container>
    </section>
  );
}
