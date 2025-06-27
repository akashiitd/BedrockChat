import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css'; // Import the new CSS file

// Custom component to render code blocks with a copy button
const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const code = String(children).replace(/\n$/, '');
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return !inline && match ? (
        <div style={{ position: 'relative', background: 'var(--code-bg)', borderRadius: '5px', padding: '1rem', marginBottom: '1rem' }}>
            <pre style={{ margin: 0, whiteWhiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--code-text)' }}>
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
            <button
                onClick={handleCopy}
                style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--copy-button-bg)', color: 'var(--copy-button-text)', border: 'none', borderRadius: '3px', padding: '5px 10px', cursor: 'pointer' }}
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    ) : (
        <code className={className} {...props}>
            {children}
        </code>
    );
};

function App() {
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [file, setFile] = useState(null);
    const [theme, setTheme] = useState('light'); // New theme state

    // Apply theme class to body
    useEffect(() => {
        document.body.className = `${theme}-theme`;
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleChat = async () => {
        if (!message) return;
        const newHistory = [...history, { role: 'user', content: message }];
        setHistory(newHistory);
        setMessage('');

        try {
            const response = await axios.post('http://localhost:8000/api/chat', { message, history });
            setHistory([...newHistory, { role: 'assistant', content: response.data.response }]);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        let url = '';
        if (file.type.startsWith('image/')) {
            url = 'http://localhost:8000/api/analyze-image';
        } else if (file.type === 'application/pdf') {
            url = 'http://localhost:8000/api/analyze-pdf';
        } else {
            alert('Unsupported file type');
            return;
        }

        try {
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newHistory = [...history, { role: 'user', content: `File: ${file.name}` }, { role: 'assistant', content: response.data.response }];
            setHistory(newHistory);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
        setFile(null);
    };

    return (
        <div className={`container mt-5 ${theme}-theme`}> {/* Apply theme class here */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span>Bedrock Chat</span>
                    <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
                        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
                    </button>
                </div>
                <div className="card-body" style={{ height: '400px', overflowY: 'scroll' }}>
                    {history.map((item, index) => (
                        <div key={index} className={`mb-2 text-${item.role === 'user' ? 'right' : 'left'}`}>
                            <strong>{item.role}:</strong>
                            {item.role === 'assistant' ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code: CodeBlock,
                                        p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} /> // Ensure paragraphs don't add extra margin
                                    }}
                                >
                                    {item.content}
                                </ReactMarkdown>
                            ) : (
                                <p style={{ margin: 0 }}>{item.content}</p>
                            )}
                        </div>
                    ))}
                </div>
                <div className="card-footer">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                        />
                        <button className="btn btn-primary" onClick={handleChat}>Send</button>
                    </div>
                    <div className="input-group mt-2">
                        <input type="file" className="form-control" onChange={handleFileChange} />
                        <button className="btn btn-secondary" onClick={handleFileUpload} disabled={!file}>Upload & Analyze</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;