"use client";

/**
 * Universal SVG Country Flag icons.
 * Guarantees crisp, real graphical flag display on Windows, Mac, iOS, Android.
 * (Windows emoji fonts do not support country flag emojis and only show text letters like "GB" / "US").
 */
export function FlagIcon({ country = "en", size = 18, className = "" }) {
  const code = country?.toLowerCase();

  if (code === "en" || code === "uk" || code === "gb") {
    return (
      <svg
        width={size}
        height={Math.round(size * 0.75)}
        viewBox="0 0 60 30"
        className={`inline-block rounded-xs overflow-hidden shadow-2xs shrink-0 ${className}`}
      >
        <clipPath id="uk-clip">
          <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id="uk-diag">
          <path d="M0,0 L60,30 M60,0 L0,30" />
        </clipPath>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-diag)" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </svg>
    );
  }

  if (code === "us") {
    return (
      <svg
        width={size}
        height={Math.round(size * 0.75)}
        viewBox="0 0 19 10"
        className={`inline-block rounded-xs overflow-hidden shadow-2xs shrink-0 ${className}`}
      >
        <rect width="19" height="10" fill="#B22234" />
        <path d="M0,1 h19 M0,3 h19 M0,5 h19 M0,7 h19 M0,9 h19" stroke="#fff" strokeWidth="0.8" />
        <rect width="7.6" height="5.4" fill="#3C3B6E" />
        <circle cx="2" cy="1.5" r="0.4" fill="#fff" />
        <circle cx="4" cy="1.5" r="0.4" fill="#fff" />
        <circle cx="6" cy="1.5" r="0.4" fill="#fff" />
        <circle cx="3" cy="2.7" r="0.4" fill="#fff" />
        <circle cx="5" cy="2.7" r="0.4" fill="#fff" />
        <circle cx="2" cy="3.9" r="0.4" fill="#fff" />
        <circle cx="4" cy="3.9" r="0.4" fill="#fff" />
        <circle cx="6" cy="3.9" r="0.4" fill="#fff" />
      </svg>
    );
  }

  if (code === "de") {
    return (
      <svg
        width={size}
        height={Math.round(size * 0.75)}
        viewBox="0 0 5 3"
        className={`inline-block rounded-xs overflow-hidden shadow-2xs shrink-0 ${className}`}
      >
        <rect width="5" height="1" y="0" fill="#000" />
        <rect width="5" height="1" y="1" fill="#D00" />
        <rect width="5" height="1" y="2" fill="#FFCE00" />
      </svg>
    );
  }

  if (code === "fr") {
    return (
      <svg
        width={size}
        height={Math.round(size * 0.75)}
        viewBox="0 0 3 2"
        className={`inline-block rounded-xs overflow-hidden shadow-2xs shrink-0 ${className}`}
      >
        <rect width="1" height="2" x="0" fill="#002395" />
        <rect width="1" height="2" x="1" fill="#fff" />
        <rect width="1" height="2" x="2" fill="#ED2939" />
      </svg>
    );
  }

  if (code === "es") {
    return (
      <svg
        width={size}
        height={Math.round(size * 0.75)}
        viewBox="0 0 3 2"
        className={`inline-block rounded-xs overflow-hidden shadow-2xs shrink-0 ${className}`}
      >
        <rect width="3" height="0.5" y="0" fill="#AA151B" />
        <rect width="3" height="1" y="0.5" fill="#F1BF00" />
        <rect width="3" height="0.5" y="1.5" fill="#AA151B" />
      </svg>
    );
  }

  if (code === "por" || code === "pt") {
    return (
      <svg
        width={size}
        height={Math.round(size * 0.75)}
        viewBox="0 0 3 2"
        className={`inline-block rounded-xs overflow-hidden shadow-2xs shrink-0 ${className}`}
      >
        <rect width="1.2" height="2" x="0" fill="#046A38" />
        <rect width="1.8" height="2" x="1.2" fill="#DA291C" />
        <circle cx="1.2" cy="1" r="0.35" fill="#FFCD00" />
        <circle cx="1.2" cy="1" r="0.22" fill="#fff" />
        <rect width="0.2" height="0.25" x="1.1" y="0.88" fill="#002B7F" />
      </svg>
    );
  }

  if (code === "it") {
    return (
      <svg
        width={size}
        height={Math.round(size * 0.75)}
        viewBox="0 0 3 2"
        className={`inline-block rounded-xs overflow-hidden shadow-2xs shrink-0 ${className}`}
      >
        <rect width="1" height="2" x="0" fill="#009246" />
        <rect width="1" height="2" x="1" fill="#fff" />
        <rect width="1" height="2" x="2" fill="#CE2B37" />
      </svg>
    );
  }

  return <span>🌐</span>;
}
