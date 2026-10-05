/** Small inline marks for dish and recipe rows; they take the surrounding text colour. */
export function StarIcon() {
  return (
    <svg className="mark" viewBox="0 0 24 24" width="13" height="13" aria-label="BBC Good Food">
      <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z" fill="currentColor" />
    </svg>
  );
}

export function HeartIcon() {
  return (
    <svg className="mark heart" viewBox="0 0 24 24" width="13" height="13" aria-label="In your Classics">
      <path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" fill="currentColor" />
    </svg>
  );
}

/** A tiny "V" crediting the person whose idea a feature was. */
export function CreditMark() {
  return (
    <span className="credit" title="V's idea" aria-label="V's idea">
      V
    </span>
  );
}

/** A cooking pot with a lid and two handles, for "I'm going to cook this". */
export function PotIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 10h14v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" />
      <path d="M3 12h2M19 12h2M4 10h16M10 7h4" />
    </svg>
  );
}

/** A small padlock; closed when the time is locked in, open when it is not. */
export function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d={locked ? "M8 11V8a4 4 0 0 1 8 0v3" : "M8 11V8a4 4 0 0 1 7.5-2"} />
    </svg>
  );
}
