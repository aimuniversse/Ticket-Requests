import { useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import aboutImage from "../assets/about.jpeg";
import logoImage from "../assets/logo.jpeg";
import "../styles/About.css";

function About() {
  const imageAlt = useMemo(() => "About Tick my Bus", []);

  return (
    <div className="about-page">
      <Header />
      <main className="about-main">
        <section className="about-hero">
          <div className="about-image-wrapper">
            <img src={aboutImage} alt={imageAlt} className="about-image" />
          </div>
          <div className="about-copy">
            <span className="brand-icon">
                        <img src={logoImage} alt="Tick My Bus" />
                      </span>
            <h1 className="section-label">About </h1>
            <h2>Your Trusted Bus Booking Partner</h2>
            <p>
              Tick my Bus is a modern bus booking platform focused on making travel across South India simple, affordable, and reliable. We connect travelers with trusted bus operators through an easy-to-use platform that offers seamless booking, real-time updates, and secure payment options.
            </p>
            <p>
              Beyond serving travelers, we help bus operators expand their reach by providing a dependable platform to showcase their services and connect with more customers.
            </p>
            <p>
              At Tick my Bus, our mission is to make every journey convenient, comfortable, and memorable while continuously improving the bus travel experience across South India and beyond.
            </p>
          </div>
        </section>

        <section className="about-why-choose">
          <div className="about-why-header">
            <span className="section-label">Why Choose Us</span>
            <h2>Why You Should Choose Tick my Bus?</h2>
            <p>
              Get the best deals with our Best Price Guarantee and book effortlessly with our
              user-friendly platform. Travel confidently with experienced guides ensuring a smooth journey.
            </p>
          </div>

          <div className="why-cards">
            <article className="why-card why-card-blue">
              <div className="why-icon">★</div>
              <h3>Best Price Guarantee</h3>
              <p>
                Benefit from our commitment to offering the most competitive fares, ensuring you get the
                best value for your money every time you book with Tick my Bus.
              </p>
            </article>

            <article className="why-card why-card-red">
              <div className="why-icon">🧾</div>
              <h3>Easy & Quick Booking</h3>
              <p>
                Experience the convenience of seamless and efficient booking, allowing you to secure your
                bus tickets in just a few clicks with Tick my Bus’s user-friendly platform.
              </p>
            </article>

            <article className="why-card why-card-red">
              <div className="why-icon">🧭</div>
              <h3>Experienced Guide</h3>
              <p>
                Travel confidently knowing that Tick my Bus’s experienced guides are available to assist you
                throughout your journey, providing expert advice and ensuring a smooth travel experience.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default About;
