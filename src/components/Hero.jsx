import React from "react";
import logo from "./haleemmedicose_logo.png";
function scrollToProducts() {
  const productsSection = document.getElementById("products-section");
  if (productsSection) {
    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
          <img src={logo} alt="Khan Medicines Logo" style={{ height: "220px", width: "auto", filter: "invert(1) drop-shadow(0 4px 10px rgba(0,0,0,0.6))", display: "block", margin: "0 auto", marginTop: "-40px" }} />
        <p style={{ marginTop: "-28px" }}>Medicines, healthcare products, and Essentials at the best prices</p>
        <div className="hero-buttons ">
          <button
            onClick={scrollToProducts}
            className="hero-btn secondary-btn cursor-pointer"
            type="button"
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
