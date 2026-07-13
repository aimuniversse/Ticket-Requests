import { useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import aboutImage from "../assets/about.jpeg";
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
            <h1 className="section-label">About Us</h1>
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
      </main>
      <Footer />
    </div>
  );
}

export default About;
