/**
 * HelpPage Component
 * Página de ayuda y soporte con FAQ y tutoriales
 */

import { useState } from 'react';
import { Sidebar } from '@components/Sidebar';
import './HelpPage.css';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: '¿Cómo puedo emitir mi voto?',
      answer:
        'Para emitir tu voto, inicia sesión en la plataforma, navega a la sección "Votar", selecciona la elección activa, elige tu candidato preferido y confirma tu voto. Recibirás un recibo criptográfico como comprobante.',
      category: 'voting',
    },
    {
      id: '2',
      question: '¿Es seguro votar en línea?',
      answer:
        'Sí, nuestra plataforma utiliza cifrado RSA-4096, autenticación de dos factores, y tecnología blockchain para garantizar la seguridad e integridad de tu voto. Tu identidad permanece completamente anónima.',
      category: 'security',
    },
    {
      id: '3',
      question: '¿Qué es un recibo criptográfico?',
      answer:
        'Un recibo criptográfico es un código único que prueba que tu voto fue registrado correctamente. Puedes usarlo para verificar de forma independiente que tu voto fue contado sin revelar tu identidad.',
      category: 'voting',
    },
    {
      id: '4',
      question: '¿Cómo configuro la autenticación de dos factores?',
      answer:
        'Ve a tu perfil, selecciona "Configuración de Seguridad" y luego "Autenticación de Dos Factores". Sigue las instrucciones para configurar tu método preferido (TOTP o WebAuthn).',
      category: 'security',
    },
    {
      id: '5',
      question: '¿Puedo cambiar mi voto después de emitirlo?',
      answer:
        'No, una vez que confirmas tu voto, no puede ser modificado. Esta medida garantiza la integridad del proceso electoral. Asegúrate de revisar cuidadosamente antes de confirmar.',
      category: 'voting',
    },
    {
      id: '6',
      question: '¿Cómo veo los resultados de las elecciones?',
      answer:
        'Los resultados están disponibles en la sección "Resultados" una vez que finaliza la elección. Puedes ver gráficos detallados, estadísticas de participación y resultados por región.',
      category: 'general',
    },
    {
      id: '7',
      question: '¿Qué hago si olvidé mi contraseña?',
      answer:
        'En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Ingresa tu correo electrónico y recibirás instrucciones para restablecer tu contraseña de forma segura.',
      category: 'account',
    },
    {
      id: '8',
      question: '¿Cómo puedo verificar mi identidad?',
      answer:
        'La verificación de identidad se realiza durante el registro inicial. Si necesitas actualizar tu información, contacta al soporte con tu documento de identidad.',
      category: 'account',
    },
  ];

  const categories = [
    { id: 'all', name: 'Todas', icon: '🔍' },
    { id: 'voting', name: 'Votación', icon: '🗳️' },
    { id: 'security', name: 'Seguridad', icon: '🔒' },
    { id: 'account', name: 'Cuenta', icon: '👤' },
    { id: 'general', name: 'General', icon: '📋' },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="help-page-container">
      <Sidebar />

      <div className="help-page-wrapper">
        <header className="help-header">
          <h1>Centro de Ayuda</h1>
          <p>¿Tienes preguntas? Estamos aquí para ayudarte</p>
        </header>

        <main className="help-main">
          {/* Search */}
          <div className="help-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="help-categories">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="action-card">
              <div className="action-icon" style={{ background: '#eff6ff' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>Chat en Vivo</h3>
              <p>Habla con nuestro equipo de soporte</p>
              <button className="action-btn">Iniciar Chat</button>
            </div>

            <div className="action-card">
              <div className="action-icon" style={{ background: '#d1fae5' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3>Enviar Email</h3>
              <p>Contacta por correo electrónico</p>
              <button className="action-btn">Escribir Email</button>
            </div>

            <div className="action-card">
              <div className="action-icon" style={{ background: '#fef3c7' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3>Llamar</h3>
              <p>Atención telefónica</p>
              <button className="action-btn">Ver Teléfono</button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2>Preguntas Frecuentes</h2>
            {filteredFAQs.length > 0 ? (
              <div className="faq-list">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="faq-item">
                    <button className="faq-question" onClick={() => toggleFAQ(faq.id)}>
                      <span>{faq.question}</span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`faq-icon ${expandedFAQ === faq.id ? 'expanded' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {expandedFAQ === faq.id && <div className="faq-answer">{faq.answer}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p>No se encontraron resultados para tu búsqueda</p>
              </div>
            )}
          </div>

          {/* Video Tutorials */}
          <div className="tutorials-section">
            <h2>Tutoriales en Video</h2>
            <div className="tutorials-grid">
              <div className="tutorial-card">
                <div className="tutorial-thumbnail">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <h3>Cómo votar en línea</h3>
                <p>Aprende paso a paso cómo emitir tu voto de forma segura</p>
                <span className="tutorial-duration">3:45 min</span>
              </div>

              <div className="tutorial-card">
                <div className="tutorial-thumbnail">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <h3>Configurar autenticación 2FA</h3>
                <p>Protege tu cuenta con doble factor de autenticación</p>
                <span className="tutorial-duration">2:30 min</span>
              </div>

              <div className="tutorial-card">
                <div className="tutorial-thumbnail">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <h3>Verificar tu voto</h3>
                <p>Usa tu recibo criptográfico para verificar tu voto</p>
                <span className="tutorial-duration">4:15 min</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <h2>¿Aún necesitas ayuda?</h2>
            <p>Nuestro equipo de soporte está disponible 24/7 para asistirte</p>
            <div className="contact-details">
              <div className="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>soporte@votacion.gov.co</span>
              </div>
              <div className="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+57 (1) 234-5678</span>
              </div>
              <div className="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Lunes a Viernes: 8:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

