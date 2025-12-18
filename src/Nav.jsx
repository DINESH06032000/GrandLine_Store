import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAppContext } from "./AppContext";
import './style.css';
import SearchResults from './SearchResult';
import data from "./data/products.json"

const ToastNotification = ({ toast }) => {
    if (!toast.show) return null;
    return (
        <div className="toast-notification">
            <i className={`fa-solid ${toast.type === 'wishlist' ? 'fa-heart' : 'fa-check-circle'}`}></i>
            {toast.message}
        </div>
    );
};

const Nav = () => {
    const { cartItems, wishlistItems, toast } = useAppContext();
    // --- DROPDOWN STATE ---
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    const closeSearch = () => {
        setSearchKey("");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMoreOpen(false);
            }
        };

        if (isMoreOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMoreOpen]);

    // --- CENTRALIZED THEME LOGIC ---
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const [locationData, setLocationData] = useState({
        city: '.',
        country_code: '..',
        latitude: 0,
        longitude: 0,
        loaded: false
    });

    useEffect(() => {
        const fetchIPLocation = () => {
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data && data.city) {
                        setLocationData({
                            city: data.city.toUpperCase(),
                            country_code: data.country_code,
                            latitude: data.latitude,
                            longitude: data.longitude,
                            loaded: true
                        });
                    }
                })
                .catch(err => console.error("IP Location fetch error:", err));
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Use a free reverse geocoding API to get city name from coords
                    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                        .then(res => res.json())
                        .then(data => {
                            setLocationData({
                                city: (data.city || data.locality || 'Unknown').toUpperCase(),
                                country_code: data.countryCode || 'IN',
                                latitude: latitude,
                                longitude: longitude,
                                loaded: true
                            });
                        })
                        .catch(() => fetchIPLocation()); // Fallback to IP if reverse geo fails
                },
                (error) => {
                    console.log("Geolocation denied or failed, falling back to IP:", error);
                    fetchIPLocation();
                }
            );
        } else {
            fetchIPLocation();
        }
    }, []);

    const {
        searchKey,
        setSearchKey,
        setSearchResults,
        setShowSuggestions,
        isMobileSearchOpen,
        setIsMobileSearchOpen
    } = useAppContext();

    /* ===== Debounced Search ===== */
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!searchKey.trim()) {
                setShowSuggestions(false);
                return;
            }

            const filtered = data.filter(p =>
                p.name.toLowerCase().includes(searchKey.toLowerCase())
            );

            setSearchResults(filtered);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchKey]);

    return (
        <>
            {/* --- COMMON HEADER --- */}
            <header>
                <Link to="/" className="logo" onClick={closeSearch}>
                    <span>GrandLine</span>
                </Link>

                <div className="search-bar m-hide">
                    <i className="fa-solid fa-magnifying-glass" style={{ color: '#aaa' }}></i>
                    {/* Desktop Search */}
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchKey}
                            onChange={(e) => {
                                setSearchKey(e.target.value);
                            }}
                        />
                    </div>
                </div >


                <div className="user-actions">
                    <button
                        className="action-item theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle dark mode"
                    >
                        <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i>
                        <span className="m-hide">Mode</span>
                    </button>

                    <Link to="/login" onClick={closeSearch}>
                        <div className="action-item pointer">
                            <i className="fa-regular fa-user"></i>
                            <span className="m-hide">Account</span>
                        </div>
                    </Link>
                    <Link to="/wishlist" onClick={closeSearch}>
                        <div className="action-item pointer">
                            <div className="icon-badge-wrapper">
                                <i className="fa-regular fa-heart"></i>
                                {wishlistItems.length > 0 && (
                                    <span className="nav-badge">{wishlistItems.length}</span>
                                )}
                            </div>
                            <span className="m-hide">Wishlist</span>
                        </div>
                    </Link>
                    <Link to="/cart" onClick={closeSearch}>
                        <div className="action-item pointer">
                            <div className="icon-badge-wrapper">
                                <i className="fa-solid fa-bag-shopping"></i>
                                {cartItems.length > 0 && (
                                    <span className="nav-badge">
                                        {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                    </span>
                                )}
                            </div>
                            <span className="m-hide">Cart</span>
                        </div>
                    </Link>
                </div>
            </header >
            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div className="mobile-search-overlay">
                    <div className="mobile-search-box">
                        <input
                            autoFocus
                            placeholder="Search products..."
                            value={searchKey}
                            onChange={e => setSearchKey(e.target.value)}
                        />
                        <button onClick={() => setIsMobileSearchOpen(false)}>✕</button>
                    </div>
                    <SearchResults />
                </div>
            )}
            {/* --- COMMON NAVIGATION --- */}
            <nav className="nav" >
                <div className="nav-more-container pointer" ref={dropdownRef}>
                    <div
                        className={`nav-more ${isMoreOpen ? 'active' : ''}`}
                        role="button"
                        tabIndex="0"
                        onClick={() => setIsMoreOpen(!isMoreOpen)}
                    >
                        <i className={`fa-solid ${isMoreOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                    </div>
                    {isMoreOpen && (
                        <div className="nav-more-dropdown">
                            <NavLink to="/" onClick={() => { setIsMoreOpen(false), closeSearch }} className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
                            <NavLink to="/blog" onClick={() => { setIsMoreOpen(false), closeSearch }} className={({ isActive }) => isActive ? 'active' : ''}>Blog</NavLink>
                            <NavLink to="/categories" onClick={() => { setIsMoreOpen(false), closeSearch }} className={({ isActive }) => isActive ? 'active' : ''}>Categories</NavLink>
                            <NavLink to="/products" onClick={() => { setIsMoreOpen(false), closeSearch }} className={({ isActive }) => isActive ? 'active' : ''}>Products</NavLink>
                        </div>
                    )}
                </div>

                <div className="nav-links">
                    {/* NavLink automatically adds an 'active' class, but we can also style inline */}
                    <NavLink
                        to="/" onClick={closeSearch}
                        className={({ isActive }) => isActive ? "nav-item active-link" : "nav-item"}
                        style={({ isActive }) => isActive ? { color: 'var(--accent-green)', fontWeight: 700 } : {}}
                    >
                        Home
                    </NavLink>

                    <div className="nav-item has-dropdown">
                        <NavLink
                            className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
                            to="/categories" onClick={closeSearch}
                            style={({ isActive }) => isActive ? { color: 'var(--accent-green)', fontWeight: 700 } : {}}
                        >
                            Categories <i className="fa-solid fa-angle-down"></i>
                        </NavLink>
                        <div className="dropdown pointer">
                            <div className="dropdown-grid">
                                <Link className="dropdown-card" to="/products?category=Snacks" onClick={closeSearch}>
                                    <img src="/GrandLine/cashew.png" alt="Snack" />
                                    <div className="title">SNACK & SPICE</div>
                                </Link>
                                <Link className="dropdown-card" to="/products?category=Juice" onClick={closeSearch} >
                                    <img src="/GrandLine/drink.png" alt="Drink" />
                                    <div className="title">JUICE & DRINKS</div>
                                </Link>
                                <Link className="dropdown-card" to="/products?category=Seafood" onClick={closeSearch}>
                                    <img src="/GrandLine/fish.png" alt="Fish" />
                                    <div className="title">SEAFOOD</div>
                                </Link>
                                <Link className="dropdown-card" to="/products?category=Bakery" onClick={closeSearch}>
                                    <img src="/GrandLine/fast-food.png" alt="Fast Food" />
                                    <div className="title">FAST FOOD</div>
                                </Link>
                                <Link className="dropdown-card" to="/products?category=Dairy" onClick={closeSearch}>
                                    <img src="/GrandLine/eggs.png" alt="Eggs" />
                                    <div className="title">EGGS</div>
                                </Link>
                                <Link className="dropdown-card more-card" to="/categories" onClick={closeSearch}>
                                    <div className="more-icon-circle">
                                        <i className="fa-solid fa-angle-right"></i>
                                    </div>
                                    <div className="title">MORE</div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="nav-item has-dropdown pointer">
                        <NavLink
                            className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
                            to="/products" onClick={closeSearch}
                            style={({ isActive }) => isActive ? { color: 'var(--accent-green)', fontWeight: 700 } : {}}
                        >
                            Products <i className="fa-solid fa-angle-down"></i>
                        </NavLink>
                        <div className="dropdown">
                            <div className="dropdown-grid">
                                <Link className="dropdown-card" to="/products?category=Fruit" onClick={closeSearch}>
                                    <img src="https://cdn-icons-png.flaticon.com/512/7910/7910224.png" alt="Fruits" />
                                    <div className="title">FRUITS</div>
                                </Link>
                                <Link className="dropdown-card" to="/products?category=Vegetable" onClick={closeSearch}>
                                    <img src="https://cdn-icons-png.flaticon.com/512/7910/7910612.png" alt="Vegetables" />
                                    <div className="title">VEGETABLES</div>
                                </Link>
                                <Link className="dropdown-card more-card" to="/products">
                                    <div className="more-icon-circle">
                                        <i className="fa-solid fa-angle-right"></i>
                                    </div>
                                    <div className="title">MORE</div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <NavLink
                        to="/blog" onClick={closeSearch}
                        className="nav-item"
                        style={({ isActive }) => isActive ? { color: 'var(--accent-green)', fontWeight: 700 } : {}}
                    >
                        Blog
                    </NavLink>
                </div>

                <div className="location pointer">
                    {locationData.city}, {locationData.country_code} <i className="fa-solid fa-location-dot"></i>
                    <div className="location-dropdown">
                        <iframe
                            className="mini-map"
                            src={`https://maps.google.com/maps?q=${locationData.latitude},${locationData.longitude}&hl=en&z=14&output=embed`}
                            loading="lazy"
                            allowFullScreen=""
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </nav >

            <main className="layout-content-wrapper">
                {searchKey && (
                    <div className="search-results-overlay">
                        <SearchResults />
                    </div>
                )}
                <Outlet />
            </main>


            {/* Footer */}
            <footer>
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="logo">
                            <span>GrandLine</span>
                        </div>
                        <p>We provide the best quality fresh organic food directly from the farm to your doorstep with love and care.</p>
                        <div className="social-links">
                            <a href="#" className="footer-social-btn"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="footer-social-btn"><i className="fa-brands fa-twitter"></i></a>
                            <a href="#" className="footer-social-btn"><i className="fa-brands fa-instagram"></i></a>
                            <a href="#" className="footer-social-btn"><i className="fa-brands fa-pinterest"></i></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/about" onClick={closeSearch}>About Us</Link></li>
                            <li><Link to="/" onClick={closeSearch}>Shop</Link></li>
                            <li><Link to="/blog" onClick={closeSearch}>Blog</Link></li>
                            <li><Link to="/about#contact" onClick={closeSearch}>Contact</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Categories</h4>
                        <ul className="footer-links">
                            <li><Link to="/categories" onClick={closeSearch}>Fruits & Vegetables</Link></li>
                            <li><Link to="/categories" onClick={closeSearch}>Dairy Products</Link></li>
                            <li><Link to="/categories" onClick={closeSearch}>Package Food</Link></li>
                            <li><Link to="/categories" onClick={closeSearch}>Beverages</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Help Center</h4>
                        <ul className="footer-links">
                            <li><Link to="/help#payments" onClick={closeSearch}>Payments</Link></li>
                            <li><Link to="/help#shipping" onClick={closeSearch}>Shipping</Link></li>
                            <li><Link to="/help#returns" onClick={closeSearch}>Product Returns</Link></li>
                            <li><Link to="/help#faq" onClick={closeSearch}>FAQ</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="copyright">
                    <p>&copy; 2025 GrandLine. All rights reserved.</p>
                </div>
            </footer>

            <ToastNotification toast={toast} />
        </>
    );
};

export default Nav;