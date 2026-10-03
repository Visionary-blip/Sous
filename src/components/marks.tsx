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
