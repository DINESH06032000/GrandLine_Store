import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "./AppContext";
import "./pages/ProductDetails.css";
import "./pages/Products.css";

const SearchResults = () => {
  const {
   searchResults,
  addToCart,
  toggleWishlist,
  isInWishlist,
  setSearchKey,
  } = useAppContext();

  if (!searchResults || searchResults.length === 0) {
    return <p style={{ padding: "20px" }}>No products found</p>;
  }

  return (
    <div className="products-grid-container">
      {searchResults.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          isInWishlist={isInWishlist}
        />
      ))}
    </div>
  );
};

/* ===============================
   SINGLE PRODUCT CARD
================================ */
const ProductCard = ({ product, addToCart, toggleWishlist, isInWishlist }) => {
  return (
    <div className="product-card">

      {/* BADGE */}
      {product.badge && (
        <span className="product-badge">{product.badge}</span>
      )}

      {/* IMAGE + WISHLIST */}
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-img-wrapper">
          <img src={product.img} alt={product.name} />

          <button
            className="wishlist-icon-btn"
            onClick={(e) => {
              e.preventDefault(); // stop navigation
              toggleWishlist(product);
            }}
            style={{
              color: isInWishlist(product.id)
                ? "var(--accent-red)"
                : "var(--text-secondary)"
            }}
          >
            <i
              className={`${
                isInWishlist(product.id) ? "fa-solid" : "fa-regular"
              } fa-heart`}
            ></i>
          </button>
        </div>
      </Link>

      {/* INFO */}
      <div className="product-info">

        {/* RATING */}
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <i
              key={i}
              className={`fa-star ${
                i < Math.floor(product.rating)
                  ? "fa-solid"
                  : "fa-regular"
              }`}
            ></i>
          ))}
        </div>

        {/* NAME */}
        <Link to={`/product/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>

        {/* PRICE + CART */}
        <div className="product-footer">
          <span className="product-price">{product.price}</span>

          <button
            className="add-btn"
            onClick={() => addToCart(product)}
            title="Add to cart"
          >
            <i className="fa-solid fa-cart-plus"></i>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SearchResults;
