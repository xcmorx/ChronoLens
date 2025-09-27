import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- MOCK DATA ---
const photoCollection = [
    { id: 1, title: 'V-J Day in Times Square', date: '1945', location: 'New York, USA', description: 'A U.S. Navy sailor kisses a stranger on Victory over Japan Day (V-J Day) in Times Square, New York City, at the end of World War II.', imageUrl: 'https://i.imgur.com/u7MMb9s.jpeg' },
    { id: 2, title: 'Migrant Mother', date: '1936', location: 'California, USA', description: 'Florence Owens Thompson, a destitute pea-picker, with her children during the Great Depression. Photographed by Dorothea Lange.', imageUrl: 'https://i.imgur.com/YhHNBGZ.jpeg' },
    { id: 3, title: 'Tank Man', date: '1989', location: 'Beijing, China', description: 'An unidentified man stands in front of a column of tanks leaving Tiananmen Square, the morning after the Chinese military had suppressed the protests.', imageUrl: 'https://i.imgur.com/v2QY0jH.jpeg' },
    { id: 4, title: 'Earthrise', date: '1968', location: 'Lunar Orbit', description: 'Photograph of Earth and parts of the Moon\'s surface taken by astronaut William Anders during the Apollo 8 mission.', imageUrl: 'https://i.imgur.com/N7b8GDc.jpeg' },
    { id: 5, title: 'Lunch atop a Skyscraper', date: '1932', location: 'New York, USA', description: 'Construction workers eating lunch, sitting on a steel beam 850 feet (260 meters) above the ground on the 69th floor of the RCA Building.', imageUrl: 'https://i.imgur.com/8nzGEEx.jpeg' },
    { id: 6, title: 'The Burning Monk', date: '1963', location: 'Saigon, Vietnam', description: 'Buddhist monk Thích Quảng Đức performs self-immolation to protest the persecution of Buddhists by the South Vietnamese government.', imageUrl: 'https://i.imgur.com/K3aYxZF.jpeg' },
    { id: 7, title: 'First Flight', date: '1903', location: 'Kitty Hawk, USA', description: 'Orville Wright at the controls of the Wright Flyer, with his brother Wilbur running alongside, during the first successful powered flight.', imageUrl: 'https://i.imgur.com/e2s4L5C.jpeg' },
    { id: 8, title: 'Raising the Flag on Iwo Jima', date: '1945', location: 'Iwo Jima, Japan', description: 'Five United States Marines and a Navy corpsman raise a U.S. flag atop Mount Suribachi during the Battle of Iwo Jima in World War II.', imageUrl: 'https://i.imgur.com/x2gD1cO.jpeg' },
    { id: 9, title: 'Man on the Moon', date: '1969', location: 'The Moon', description: 'Astronaut Buzz Aldrin, lunar module pilot, walks on the surface of the Moon during the Apollo 11 mission.', imageUrl: 'https://i.imgur.com/Uv6A88N.jpeg' },
    { id: 10, title: 'Construction of the Eiffel Tower', date: '1888', location: 'Paris, France', description: 'The Eiffel Tower under construction, a marvel of 19th-century engineering, being prepared for the 1889 Exposition Universelle.', imageUrl: 'https://i.imgur.com/8aM0LzC.jpeg'},
    { id: 11, title: 'Titanic Departs Southampton', date: '1912', location: 'Southampton, UK', description: 'The RMS Titanic leaving the port of Southampton on its maiden and only voyage.', imageUrl: 'https://i.imgur.com/mO3hVqD.jpeg'},
    { id: 12, title: 'Berlin Wall Falls', date: '1989', location: 'Berlin, Germany', description: 'East German citizens climb onto the Berlin Wall at the Brandenburg Gate, a pivotal moment in the fall of the Iron Curtain.', imageUrl: 'https://i.imgur.com/vHqY7bE.jpeg'},
];

type Photo = typeof photoCollection[0];

// --- API & UTILS ---
let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

// --- UI COMPONENTS ---

const Icon = ({ name }) => {
    const icons = {
        collection: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
        ai: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect x="4" y="12" width="8" height="8" rx="2"></rect><path d="M12 12v8h4"></path><path d="M16 12h4v-4"></path><path d="M20 12h-4"></path></svg>,
        access: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.08V8a2 2 0 0 0-2-2h-4"></path><path d="M8 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"></path><path d="M12 20v-4"></path><path d="M12 8V4"></path><path d="M20 18.32V16a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2.32"></path></svg>,
        check: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
        gemini: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 3.01C9.5 3.01 3.25 6.74 3.03 13.01C2.86 17.84 6.84 21.98 12 21.98C12.89 21.98 13.75 21.84 14.54 21.59C14.07 20.89 13.78 20.06 13.78 19.16C13.78 16.95 15.58 15.15 17.79 15.15C18.69 15.15 19.52 15.44 20.22 15.91C21.46 13.83 21.95 11.23 21.49 8.83C21.03 6.43 19.66 4.41 17.79 3.01C15.92 1.61 13.1 1.5 9.5 3.01Z" fill="currentColor"></path><path d="M17.79 16.16C16.14 16.16 14.78 17.52 14.78 19.17C14.78 20.82 16.14 22.18 17.79 22.18C19.44 22.18 20.8 20.82 20.8 19.17C20.8 17.52 19.44 16.16 17.79 16.16Z" fill="currentColor"></path></svg>
    };
    return icons[name] || null;
};

const Loader = () => <div className="loader"></div>;

const AuthModal = ({ mode, setMode, onAuthSuccess, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
             setError('Password must be at least 6 characters.');
            return;
        }
        setError('');
        console.log(`${mode} with:`, { email });
        localStorage.setItem('userEmail', email);
        onAuthSuccess();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="button button-primary">
                        {mode === 'signup' ? 'Sign Up' : 'Log In'}
                    </button>
                </form>
                <p className="form-switch">
                    {mode === 'signup' ? 'Already have an account?' : 'Don’t have an account?'}
                    <span onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
                        {' '}{mode === 'signup' ? 'Log In' : 'Sign Up'}
                    </span>
                </p>
            </div>
        </div>
    );
};

const PaymentModal = ({ onClose, onPaymentSuccess }) => {
    const handlePayment = () => {
        // Mock payment logic
        console.log('Processing payment...');
        setTimeout(() => {
            console.log('Payment successful!');
            onPaymentSuccess();
        }, 1500);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Subscribe to ChronoLens</h2>
                <div className="pricing-card" style={{border: 'none', boxShadow: 'none', padding: '1rem 0'}}>
                    <p className="price">$9<span>/month</span></p>
                    <ul className="pricing-features">
                        <li><Icon name="check" /> Unlimited access to photo archive</li>
                        <li><Icon name="check" /> High-resolution downloads</li>
                        <li><Icon name="check" /> AI-powered photo insights</li>
                        <li><Icon name="check" /> Cancel anytime</li>
                    </ul>
                    <button className="button button-primary" onClick={handlePayment}>
                        Confirm Subscription
                    </button>
                </div>
            </div>
        </div>
    );
};

const PhotoDetailModal = ({ photo, onClose }) => {
    const [geminiQuery, setGeminiQuery] = useState('');
    const [geminiResponse, setGeminiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGeminiSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!geminiQuery.trim() || !ai) return;

        setIsLoading(true);
        setGeminiResponse('');

        const prompt = `Based on the historical photo titled "${photo.title}" from ${photo.date}, which is described as "${photo.description}", answer the following question: ${geminiQuery}`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setGeminiResponse(response.text);
        } catch (error) {
            console.error("Gemini API error:", error);
            setGeminiResponse('Sorry, I was unable to answer that question. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content photo-detail-modal" onClick={(e) => e.stopPropagation()}>
                 <button className="modal-close" onClick={onClose}>&times;</button>
                 <div className="photo-detail-content">
                    <div className="photo-detail-image">
                        <img src={photo.imageUrl} alt={photo.title} />
                    </div>
                    <div className="photo-detail-info">
                        <div>
                          <h2>{photo.title}</h2>
                          <p className="photo-detail-meta">{photo.date} - {photo.location}</p>
                          <p className="photo-detail-description">{photo.description}</p>
                        </div>
                        <div className="gemini-interaction">
                            <h3><Icon name="gemini" /> Ask <span className="logo-accent">Gemini</span></h3>
                            <form className="gemini-form" onSubmit={handleGeminiSubmit}>
                                <input
                                    type="text"
                                    placeholder="e.g., What was the context?"
                                    value={geminiQuery}
                                    onChange={e => setGeminiQuery(e.target.value)}
                                />
                                <button type="submit" className="button button-primary">Ask</button>
                            </form>
                            <div className="gemini-response">
                                {isLoading ? <Loader /> : geminiResponse || 'Ask a question to learn more about this photo.'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LandingPage = ({ onAuthAction }) => (
    <div className="landing-page container">
        <header className="lp-header">
            <div className="logo">Chrono<span className="logo-accent">Lens</span></div>
            <nav className="lp-nav">
                <button className="button button-secondary" onClick={() => onAuthAction('login')}>Log In</button>
                <button className="button button-primary" onClick={() => onAuthAction('signup')}>Start Free Trial</button>
            </nav>
        </header>
        <main>
            <section className="hero">
                <h1>Step Through Time with Every Pixel</h1>
                <p>Explore the world's most iconic historical moments through a vast, curated collection of high-resolution photographs. Uncover the stories that shaped our past.</p>
                <div className="hero-buttons">
                    <button className="button button-primary" onClick={() => onAuthAction('signup')}>Start Free Trial</button>
                </div>
            </section>

            <section className="features">
                <h2>Why ChronoLens?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <Icon name="collection" />
                        <h3>Vast Collection</h3>
                        <p>Access thousands of meticulously curated historical photos spanning centuries and continents.</p>
                    </div>
                    <div className="feature-card">
                        <Icon name="ai" />
                        <h3>AI-Powered Insights</h3>
                        <p>Go beyond the image. Ask questions and get detailed historical context powered by Gemini.</p>
                    </div>
                    <div className="feature-card">
                        <Icon name="access" />
                        <h3>Unlimited Access</h3>
                        <p>Enjoy unrestricted access and high-resolution downloads on any device, anytime.</p>
                    </div>
                </div>
            </section>

            <section className="pricing">
                <h2>Simple, Affordable Pricing</h2>
                <p>Unlock all features with one simple plan.</p>
                <div className="pricing-card">
                    <h3>Premium Access</h3>
                    <p className="price">$9<span>/month</span></p>
                    <ul className="pricing-features">
                        <li><Icon name="check" /> Unlimited access to photo archive</li>
                        <li><Icon name="check" /> High-resolution downloads</li>
                        <li><Icon name="check" /> AI-powered photo insights</li>
                        <li><Icon name="check" /> Cancel anytime</li>
                    </ul>
                    <button className="button button-primary" onClick={() => onAuthAction('signup')}>Start Your Journey</button>
                </div>
            </section>
        </main>
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} ChronoLens. All Rights Reserved.</p>
        </footer>
    </div>
);

const Dashboard = ({ userEmail, onLogout }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    const filteredPhotos = photoCollection.filter(photo =>
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.date.includes(searchQuery)
    );

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="logo">Chrono<span className="logo-accent">Lens</span></div>
                <div className="user-info">
                    <span className="subscription-status">PREMIUM</span>
                    <span>{userEmail}</span>
                    <button className="button button-secondary" onClick={onLogout}>Logout</button>
                </div>
            </header>
            <main className="dashboard-main">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by title, date, or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="photo-grid">
                    {filteredPhotos.map(photo => (
                        <div key={photo.id} className="photo-card" onClick={() => setSelectedPhoto(photo)}>
                            <img src={photo.imageUrl} alt={photo.title} loading="lazy" />
                            <div className="photo-card-info">
                                <h3>{photo.title}</h3>
                                <p>{photo.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            {selectedPhoto && <PhotoDetailModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
        </div>
    );
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userEmail'));
    const [hasSubscription, setHasSubscription] = useState(!!localStorage.getItem('hasSubscription'));
    const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');

    const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleAuthAction = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
    };

    const handleAuthSuccess = () => {
        const email = localStorage.getItem('userEmail');
        if (email) {
            setUserEmail(email);
            setIsLoggedIn(true);
            setAuthMode(null);
            setShowPaymentModal(true); // Always show payment after auth for this flow
        }
    };

    const handlePaymentSuccess = () => {
        localStorage.setItem('hasSubscription', 'true');
        setHasSubscription(true);
        setShowPaymentModal(false);
    };
    
    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('hasSubscription');
        setIsLoggedIn(false);
        setHasSubscription(false);
        setUserEmail('');
    };

    if (isLoggedIn && hasSubscription) {
        return <Dashboard userEmail={userEmail} onLogout={handleLogout} />;
    }

    return (
        <>
            <LandingPage onAuthAction={handleAuthAction} />
            {authMode && (
                <AuthModal
                    mode={authMode}
                    setMode={setAuthMode}
                    onAuthSuccess={handleAuthSuccess}
                    onClose={() => setAuthMode(null)}
                />
            )}
            {showPaymentModal && (
                <PaymentModal
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
