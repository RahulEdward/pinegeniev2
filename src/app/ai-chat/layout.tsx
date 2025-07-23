import './ai-chat.css';

export default function AIChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ai-chat-layout">
      {children}
    </div>
  );
}