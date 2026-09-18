const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

export const IncorporationIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 20V6l8-3 8 3v14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 20v-5h6v5M9 10h.01M12 10h.01M15 10h.01M9 13h.01M12 13h.01M15 13h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const AuditIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M7 3h8l4 4v14H7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9.5 12.5l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FemaIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="9" r="4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="16" cy="15" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 13c0 3 2.5 5 4 6M16 11c0-3-2.5-5-4-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const GovernanceIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3v18M6 7l-3 6h6l-3-6ZM18 7l-3 6h6l-3-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M4 21h16M3 13h6M15 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const XbrlIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 20V4h11l5 5v11z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M8 12l3 3-3 3M14 18l3-3-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrademarkIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M9 10.2l2 2 4-4.4M8 16l-1.5 5L12 18l5.5 3L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MergerIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 5l6 6-6 6M19 5l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CsrIcon = (p) => (
  <svg {...base} {...p}>
    <path
      d="M12 20s-7-4.2-7-9.4C5 7.6 7.2 5.5 9.8 5.5c1.2 0 2.4.6 3.2 1.7.8-1.1 2-1.7 3.2-1.7 2.6 0 4.8 2.1 4.8 5.1 0 5.2-9 9.4-9 9.4Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export const EsopIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="17" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3.5 20c.4-3.6 2.8-5.6 5.5-5.6s5.1 2 5.5 5.6M14.8 20c.3-2.8 1.9-4.6 3.9-4.6s3.4 1.6 3.8 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const WindingUpIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3l8 4v5c0 5-3.5 7.8-8 9-4.5-1.2-8-4-8-9V7l8-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M9 11l3 3 3-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PhoneIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <path
      d="M5 4h3.2l1.3 4-2 1.4a11 11 0 0 0 5.1 5.1l1.4-2 4 1.3V17c0 1.1-.9 2-2 2C10.6 19 5 13.4 5 6c0-1.1.9-2 2-2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export const MailIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 6.5l8 6.5 8-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PinIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <path
      d="M12 21s-6.5-5.7-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.3-6.5 11-6.5 11Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowRightIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CloseIcon = (p) => (
  <svg {...base} width={22} height={22} {...p}>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const LinkedInIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
    <path d="M7.5 10.5v6M7.5 7.8v.01M11.5 16.5v-3.6c0-1.3.9-2.2 2-2.2s2 .9 2 2.2v3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MailOutlineIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
    <path d="M7 8.5l5 4 5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
