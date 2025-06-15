import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Package,
  Search,
  Grid,
  List,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import "./Dashboard.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  const productsPerPage = 12;

  const categories = [
    "all",
    "electronics",
    "jewelery",
    "men's clothing",
    "women's clothing",
  ];

  const sortOptions = [
    { value: "title", label: "Name" },
    { value: "price", label: "Price" },
    { value: "rating.rate", label: "Rating" },
    { value: "category", label: "Category" },
  ];

  useEffect(() => {
    setSearchLoading(true);

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setSearchLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      setSearchLoading(false);
    };
  }, [searchTerm]);

  // Memoize price range to prevent unnecessary re-renders
  const stablePriceRange = useMemo(
    () => ({
      min: priceRange.min,
      max: priceRange.max,
    }),
    [priceRange.min, priceRange.max]
  );

  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);

      let url = "https://fakestoreapi.com/products";

      if (selectedCategory !== "all") {
        url = `https://fakestoreapi.com/products/category/${selectedCategory}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error("Products fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const filterAndPaginateProducts = useCallback(() => {
    let filteredData = [...allProducts];

    if (debouncedSearchTerm) {
      filteredData = filteredData.filter(
        (product) =>
          product.title
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          product.category
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      );
    }

    filteredData = filteredData.filter(
      (product) =>
        product.price >= stablePriceRange.min &&
        product.price <= stablePriceRange.max
    );

    filteredData.sort((a, b) => {
      let aValue = sortBy.includes(".")
        ? sortBy.split(".").reduce((obj, key) => obj[key], a)
        : a[sortBy];
      let bValue = sortBy.includes(".")
        ? sortBy.split(".").reduce((obj, key) => obj[key], b)
        : b[sortBy];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Implement pagination
    const totalProducts = filteredData.length;
    setTotalPages(Math.ceil(totalProducts / productsPerPage));

    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredData.slice(
      startIndex,
      startIndex + productsPerPage
    );

    setProducts(paginatedProducts);
  }, [
    allProducts,
    debouncedSearchTerm,
    stablePriceRange.min,
    stablePriceRange.max,
    sortBy,
    sortOrder,
    currentPage,
  ]);

  // Initial data fetch
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  useEffect(() => {
    if (allProducts.length > 0) {
      filterAndPaginateProducts();
    }
  }, [allProducts.length, filterAndPaginateProducts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
      toast.success("Removed from favorites");
    } else {
      newFavorites.add(productId);
      toast.success("Added to favorites");
    }
    setFavorites(newFavorites);
  };

  const addToCart = (product) => {
    toast.success(`${product.title} added to cart!`);
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange({ min, max });
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="star filled" style={{ opacity: 0.5 }} />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  if (loading && allProducts.length === 0) {
    return (
      <div className="products-container">
        <LoadingSpinner text="Loading products..." />
      </div>
    );
  }

  return (
    <div className="products-container">
      {/* Header */}
      <div className="products-header">
        <Package className="icon" />
        <h1>Our Products</h1>
      </div>

      {/* Controls Section */}
      <div className="products-controls">
        <div className="search-filter-section">
          <div className="search-container">
            {searchLoading ? (
              <div className="search-icon">
                <LoadingSpinner size="small" />
              </div>
            ) : (
              <Search className="search-icon" />
            )}
            <input
              type="text"
              className="search-input"
              placeholder="Search products by name, description, or category..."
              value={searchTerm}
              onChange={handleSearch}
              disabled={loading && allProducts.length === 0}
            />
            {searchLoading && <div className="search-status">Searching...</div>}
          </div>

          <div className="filter-container">
            {/* Category Filter */}
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <div className="price-range-container">
              <span className="price-range-label">Price Range:</span>
              <div className="price-range-inputs">
                <input
                  type="number"
                  className="price-range-input"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    handlePriceRangeChange(
                      Number(e.target.value),
                      priceRange.max
                    )
                  }
                />
                <span className="price-range-separator">-</span>
                <input
                  type="number"
                  className="price-range-input"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    handlePriceRangeChange(
                      priceRange.min,
                      Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="view-mode-container">
          <button
            onClick={() => setViewMode("grid")}
            className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
          >
            <Grid className="icon" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
          >
            <List className="icon" />
          </button>
        </div>

        <div className="sort-container">
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="sort-btn"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="icon" />
            ) : (
              <SortDesc className="icon" />
            )}
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </button>
        </div>
      </div>

      {/* Products Grid/List */}
      <div
        className={`${viewMode === "grid" ? "products-grid" : "products-list"}`}
      >
        {products.length === 0 && !loading ? (
          <div className="empty-state">
            <Package className="icon" />
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className={`product-card ${
                viewMode === "list" ? "list-view" : ""
              }`}
            >
              <div className="product-image-container">
                <img
                  src={product.image}
                  alt={product.title}
                  className="product-image"
                />
                <div className="product-overlay">
                  <div className="quick-actions">
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className={`action-btn favorite ${
                        favorites.has(product.id) ? "active" : ""
                      }`}
                    >
                      <Heart className="icon" />
                    </button>
                    <Link to={`/products/${product.id}`} className="action-btn">
                      <Eye className="icon" />
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      className="action-btn"
                    >
                      <ShoppingCart className="icon" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="product-content">
                <div className="product-category">{product.category}</div>
                <h3 className="product-title">{product.title}</h3>
                <p className="product-description">
                  {product.description.substring(0, 120)}...
                </p>
                <div className="product-footer">
                  <div className="product-price">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="product-rating">
                    <div className="rating-stars">
                      {renderStars(product.rating.rate)}
                    </div>
                    <span className="rating-text">({product.rating.rate})</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <ChevronLeft className="icon" />
          </button>

          <div className="pagination-info">
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`pagination-btn ${
                  currentPage === pageNumber ? "active" : ""
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            <ChevronRight className="icon" />
          </button>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && currentPage > 1 && (
        <div className="loading-overlay">
          <LoadingSpinner size="small" />
        </div>
      )}

      {/* Results info */}
      <div className="results-info">
        <p>
          Showing {products.length} of {totalPages * productsPerPage} products
          {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
          {searchLoading &&
            searchTerm &&
            searchTerm !== debouncedSearchTerm &&
            " (searching...)"}
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
        </p>
        {searchTerm && searchTerm !== debouncedSearchTerm && (
          <p className="search-status-text">
            Still typing... Results will update automatically.
          </p>
        )}
      </div>
    </div>
  );
};

export default Products;
