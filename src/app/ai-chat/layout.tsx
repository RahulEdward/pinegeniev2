import './ai-chat.css';

export default function AIChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ai-chat-layout" style={{ height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  );
}