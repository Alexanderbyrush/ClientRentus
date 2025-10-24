<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="footer-col">
        <h4>Sobre Nosotros</h4>
        <p>
          Somos una plataforma dedicada a ayudarle a encontrar la casa ideal
          según tu estilo de vida.
        </p>
      </div>

      <div class="footer-col">
        <h4>Enlaces Rápidos</h4>
        <ul>
          <li>
            <router-link to="/sobre-nosotros">Quiénes Somos</router-link>
          </li>
          <li><router-link to="/propiedades">Propiedades</router-link></li>
          <li><a href="#">Contacto</a></li>
          <li><a href="#">Preguntas Frecuentes</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Contacto</h4>
        <ul>
          <li>
            <img
              src="https://img.icons8.com/ios-glyphs/20/ffffff/new-post.png"
            />
            <a href="mailto:soporte@RentUs.com">soporte@RentUs.com</a>
          </li>
          <li>
            <img src="https://img.icons8.com/ios-filled/20/ffffff/phone.png" />
            <span>+57 3218598902</span>
          </li>
          <li>
            <img src="https://img.icons8.com/ios-filled/20/ffffff/marker.png" />
            <span>Calle RentUs 123, Popayán</span>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Síguenos</h4>
        <div class="social-icons">
          <a href="#"
            ><img
              src="https://img.icons8.com/ios-filled/24/ffffff/facebook-new.png"
              alt="Facebook"
          /></a>
          <a href="#"
            ><img
              src="https://img.icons8.com/ios-filled/24/ffffff/instagram-new.png"
              alt="Instagram"
          /></a>
          <a href="#"
            ><img
              src="https://img.icons8.com/ios-filled/24/ffffff/twitterx--v2.png"
              alt="X"
          /></a>
        </div>
      </div>
    </div>

    <hr />

    <div class="footer-bottom">
      <p>&copy; 2025 RentUs. Todos los derechos reservados</p>
      <div class="footer-links">
        <a href="#">Aviso Legal</a>
        <span>|</span>
        <a href="#">Política de Privacidad</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(135deg, #3b251d 0%, #2e1d17 100%);
  color: #f0e5db;
  padding: 3rem 2rem 1.5rem;
  margin-top: auto;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.footer-col h4 {
  color: #da9c5f;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.footer-col p {
  line-height: 1.6;
  opacity: 0.9;
}

.footer-col ul {
  list-style: none;
  padding: 0;
}

.footer-col ul li {
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-col a {
  color: #f0e5db;
  text-decoration: none;
  transition: color 0.3s ease;
  opacity: 0.9;
}

.footer-col a:hover {
  color: #da9c5f;
  opacity: 1;
}

.footer-col ul li img {
  opacity: 0.8;
}

.social-icons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.social-icons a:hover {
  background: #da9c5f;
  transform: translateY(-2px);
}

.social-icons img {
  width: 20px;
  height: 20px;
}

hr {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 2rem auto;
  max-width: 1200px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-bottom p {
  opacity: 0.8;
  margin: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-links a {
  color: #f0e5db;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.footer-links a:hover {
  opacity: 1;
  color: #da9c5f;
}

.footer-links span {
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .footer {
    padding: 2rem 1rem 1rem;
  }
  
  .footer-top {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-col h4 {
    font-size: 1.1rem;
  }
  
  .social-icons {
    justify-content: center;
  }
  
  .footer-bottom p {
    font-size: 0.9rem;
  }
}
</style>