export function RollingLabel({ text, nextText = text }: { text: string; nextText?: string }) {
  return (
    <span className="rolling-label">
      <span>{text}</span>
      <span aria-hidden="true">{nextText}</span>
    </span>
  );
}
