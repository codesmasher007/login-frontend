import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Package,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import "./Dashboard.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://fakestoreapi.com/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      toast.error("Failed to fetch product details");
      console.error("Product fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const addToCart = () => {
    toast.success(`${quantity} ${product.title} added to cart!`);
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} fill="#ffd700" color="#ffd700" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          size={16}
          fill="#ffd700"
          color="#ffd700"
          style={{ opacity: 0.5 }}
        />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} color="#ddd" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <LoadingSpinner text="Loading product details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="dashboard-container">
        <div className="empty-state">
          <Package size={48} />
          <h3>Product not found</h3>
          <p>The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/products")}
            className="btn btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="product-detail-header">
        <button
          onClick={() => navigate("/products")}
          className="btn btn-outline btn-small back-btn"
        >
          <ArrowLeft size={16} />
          Back to Products
        </button>
        <button onClick={shareProduct} className="btn btn-outline btn-small">
          <Share2 size={16} />
          Share
        </button>
      </div>

      <div className="product-detail">
        <div className="product-images">
          <div className="main-image">
            <img src={product.image} alt={product.title} />
          </div>
        </div>

        <div className="product-detail-info">
          <div className="product-category-detail">{product.category}</div>

          <h1 className="product-detail-title">{product.title}</h1>

          <div className="product-detail-rating">
            <div className="stars">{renderStars(product.rating.rate)}</div>
            <span className="rating-text">
              ({product.rating.rate}) • {product.rating.count} reviews
            </span>
          </div>

          <div className="product-detail-price">
            <span className="current-price">${product.price.toFixed(2)}</span>
          </div>

          <div className="product-description-detail">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn btn-outline btn-small"
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="btn btn-outline btn-small"
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={toggleFavorite}
                className={`btn btn-outline ${
                  isFavorite ? "favorite-active" : ""
                }`}
              >
                <Heart size={16} fill={isFavorite ? "#ff4757" : "none"} />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>

              <button
                onClick={addToCart}
                className="btn btn-primary add-to-cart-detail"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
            </div>
          </div>

          <div className="product-features">
            <div className="feature-item">
              <Truck size={20} />
              <div>
                <h4>Free Shipping</h4>
                <p>Free shipping on orders over $50</p>
              </div>
            </div>
            <div className="feature-item">
              <Shield size={20} />
              <div>
                <h4>Secure Payment</h4>
                <p>Your payment information is safe</p>
              </div>
            </div>
            <div className="feature-item">
              <RotateCcw size={20} />
              <div>
                <h4>Easy Returns</h4>
                <p>30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
