'use client';

import React from 'react';

interface SimpleScrollableChatProps {
  userId: string;
  initialConversation: string | null;
}

export default function SimpleScrollableChat({ userId, initialConversation }: SimpleScrollableChatProps) {
  const [messages, setMessages] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Force scroll functionality
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    const style = document.createElement('style');
    style.innerHTML = `
      * { overflow: visible !important; }
      body, html { overflow: auto !important; height: auto !important; }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "I&apos;m here to help you with Pine Script development! I can assist with strategy creation, code optimization, and technical analysis. What would you like to work on?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: '#e2e8f0',
      overflow: 'visible'
    }}>
      {/* Modern Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🤖
            </div>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Pine Genie AI
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: 0
              }}>
                Your AI-powered Pine Script assistant
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              👑 Premium Active
            </div>
            <button style={{
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#e2e8f0',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '20px',
        minHeight: 'calc(100vh - 100px)'
      }}>
        
        {/* Sidebar */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '20px',
          height: 'fit-content'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            margin: '0 0 16px 0',
            color: '#e2e8f0'
          }}>
            Quick Actions
          </h3>
          
          {[
            { icon: '📊', title: 'Generate Strategy', desc: 'Create a new Pine Script strategy' },
            { icon: '🔧', title: 'Debug Code', desc: 'Fix errors in your Pine Script' },
            { icon: '📈', title: 'Optimize Performance', desc: 'Improve strategy efficiency' },
            { icon: '💡', title: 'Get Ideas', desc: 'Explore trading concepts' }
          ].map((action, i) => (
            <div key={i} style={{
              background: 'rgba(51, 65, 85, 0.3)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(51, 65, 85, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{action.icon}</div>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                margin: '0 0 4px 0',
                color: '#e2e8f0'
              }}>
                {action.title}
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {action.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.3)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '600px'
        }}>
          
          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            maxHeight: '500px'
          }}>
            {messages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#64748b'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>🤖</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: '#e2e8f0'
                }}>
                  Welcome to Pine Genie AI
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  I&apos;m here to help you with Pine Script development, strategy creation, and trading analysis. 
                  Ask me anything!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: message.sender === 'user' 
                      ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                      : 'rgba(51, 65, 85, 0.5)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    {message.text}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'rgba(51, 65, 85, 0.5)',
                  color: '#94a3b8',
                  fontSize: '0.875rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}></div>
                    AI is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-end'
            }}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me about Pine Script, trading strategies, or anything else..."
                style={{
                  flex: 1,
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  resize: 'none',
                  minHeight: '44px',
                  maxHeight: '120px',
                  outline: 'none'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  background: inputValue.trim() && !isLoading 
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                    : 'rgba(51, 65, 85, 0.5)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  minWidth: '80px',
                  height: '44px'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AI-Powered Pine Script Development
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#64748b',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Transform your trading ideas into professional Pine Script code with our advanced AI assistant
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {[
            {
              icon: '🧠',
              title: 'Intelligent Code Generation',
              desc: 'Describe your strategy in plain English and get production-ready Pine Script code instantly.'
            },
            {
              icon: '🔍',
              title: 'Code Analysis & Debugging',
              desc: 'Upload your existing Pine Script and get detailed analysis, optimization suggestions, and bug fixes.'
            },
            {
              icon: '📊',
              title: 'Strategy Optimization',
              desc: 'Improve your trading strategies with AI-powered performance analysis and enhancement recommendations.'
            },
            {
              icon: '💡',
              title: 'Learning & Education',
              desc: 'Learn Pine Script concepts, best practices, and advanced techniques through interactive conversations.'
            }
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                margin: '0 0 12px 0',
                color: '#e2e8f0'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#94a3b8',
                margin: 0,
                lineHeight: '1.6'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '40px 20px',
        textAlign: 'center',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <p style={{
            color: '#64748b',
            margin: '0 0 16px 0',
            fontSize: '0.875rem'
          }}>
            © 2024 Pine Genie. All rights reserved. | Built with ❤️ for traders worldwide
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            fontSize: '0.875rem'
          }}>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Documentation</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}