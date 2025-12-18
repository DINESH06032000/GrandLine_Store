import React, { useEffect, useState } from "react";
import { useAppContext } from "../AppContext";
import "./Wishlist.css";

const Wishlist = () => {
    const { wishlistItems, toggleWishlist, addToCart } = useAppContext();

    const [isDarkMode, setIsDarkMode] = useState(
        () => localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        document.body.classList.toggle("dark-mode", isDarkMode);
    }, [isDarkMode]);

    const moveToCart = (item) => {
        addToCart(item);
        toggleWishlist(item); // ✅ remove from wishlist
    };

    return (
        <div className="wishlist-container">
            <div className="page-header">
                <h2>
                    My Wishlist <i className="fa-solid fa-heart"></i>
                </h2>
                <span>{wishlistItems.length} Items</span>
            </div>

            {wishlistItems.length === 0 ? (
                <p className="empty-state">Your wishlist is empty.</p>
            ) : (
                <div className="wishlist-grid">
                    {wishlistItems.map((item) => (
                        <div className="wishlist-card" key={item.id}>
                            {/* REMOVE */}
                            <button
                                className="remove-icon"
                                onClick={() => toggleWishlist(item)}
                                title="Remove"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            <div className="d-flex">
                                <img className="wishlistimg" src={item.img} alt={item.name} style={{width:"100%",height:"170px"}} />
                                <span>
                                    <h3 className="wishlistname">{item.name}</h3>
                                    <span className="price">Unit Price: {item.price}</span>
                                </span>
                            </div>


                            <button
                                className="move-btn"
                                onClick={() => moveToCart(item)}
                            >
                                Move to Cart
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
