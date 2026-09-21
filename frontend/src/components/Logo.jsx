export function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#17304f" />
      <path d="M14 40V26l10-8 10 8v14" fill="none" stroke="#E8EEF6" strokeWidth="2.2" />
      <path d="M20 40v-8h8v8" fill="none" stroke="#E8EEF6" strokeWidth="2.2" />
      <circle cx="44" cy="20" r="7" fill="none" stroke="#0D7377" strokeWidth="2.2" />
      <circle cx="44" cy="20" r="2" fill="#C4A35A" />
      <path d="M44 27v6" stroke="#0D7377" strokeWidth="2.2" />
      <circle cx="38" cy="42" r="2.2" fill="#C4A35A" />
      <circle cx="46" cy="48" r="2.2" fill="#C4A35A" />
      <circle cx="52" cy="40" r="2.2" fill="#C4A35A" />
      <path d="M40 42h6m0 0l6-2m-6 2v6" stroke="#9BB0C9" strokeWidth="1.4" />
    </svg>
  );
}
