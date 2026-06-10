<script setup lang="ts">
import HeroSection from '@/components/HeroSection.vue'
import FeatureCards from '@/components/FeatureCards.vue'
import DashboardPreview from '@/components/DashboardPreview.vue'

// Import extra background fruit images for the landing page
import orangeImg from '@/assets/images/orange.png'
import avocadoImg from '@/assets/images/avocado.png'
import bananaImg from '@/assets/images/banana.png'
</script>

<template>
  <div class="landing-page">
    <!-- Extra background fruits for the MainPage -->
    <div class="extra-fruit extra-orange" :style="{ backgroundImage: `url(${orangeImg})` }"></div>
    <div class="extra-fruit extra-banana" :style="{ backgroundImage: `url(${bananaImg})` }"></div>
    <div class="extra-fruit extra-avocado" :style="{ backgroundImage: `url(${avocadoImg})` }"></div>

    <HeroSection />
    
    <div class="divider"></div>
    
    <FeatureCards />
    
    <div class="divider"></div>
    
    <DashboardPreview />

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-logo">
          <span class="logo-text">FOODING</span>
          <p class="footer-tagline">Eat like never before!</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>Produkt</h4>
            <a href="#">Features</a>
            <a href="#">Rezepte</a>
            <a href="#">Inventar</a>
          </div>
          <div class="link-group">
            <h4>Support</h4>
            <a href="#">Hilfe</a>
            <a href="#">Kontakt</a>
            <a href="#">FAQ</a>
          </div>
          <div class="link-group">
            <h4>Rechtliches</h4>
            <a href="#">Impressum</a>
            <a href="#">Datenschutz</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 FOODING. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* Extra decorative background fruits */
.extra-fruit {
  position: absolute;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.16; /* Matches DefaultLayout fruits opacity */
  pointer-events: none;
  z-index: 0;
}

.extra-orange {
  top: 25%;
  left: 3%;
  width: 250px;
  height: 250px;
  transform: rotate(18deg);
}

.extra-banana {
  top: 50%;
  right: 2%;
  width: 280px;
  height: 280px;
  transform: rotate(-25deg);
}

.extra-avocado {
  top: 75%;
  left: 2%;
  width: 240px;
  height: 240px;
  transform: rotate(15deg);
}

.divider {
  height: 1px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, var(--panel-border), transparent);
  position: relative;
  z-index: 1;
}

.footer {
  margin-top: 100px;
  border-top: 1px solid var(--panel-border);
  padding: 80px 20px 40px;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  z-index: 1;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 60px;
  margin-bottom: 60px;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--blue), var(--blue-strong));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-tagline { color: var(--text-muted); margin-top: 8px; font-weight: 500; }
.footer-links { display: flex; flex-wrap: wrap; gap: 60px; }
.link-group h4 { color: var(--text-main); font-weight: 700; margin-bottom: 24px; }
.link-group { display: flex; flex-direction: column; gap: 12px; }
.link-group a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
.link-group a:hover { color: var(--blue); }

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
