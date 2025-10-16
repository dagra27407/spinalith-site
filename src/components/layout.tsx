export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-6">{children}</div>;
}

export function Section({
  children, className = "", id,
}: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 sm:py-24 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">{children}</h1>;
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl sm:text-3xl font-semibold">{children}</h2>;
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-lg text-gray-600 max-w-2xl">{children}</p>;
}

export function TextWrap({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl">{children}</div>;
}
