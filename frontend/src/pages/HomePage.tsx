import { Link } from 'react-router-dom';
import { Shield, Lock, Check, Eye } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Vota con Confianza, <br />
          <span className="text-primary-600">Seguridad Garantizada</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Sistema de votación electrónico con tecnología blockchain, criptografía avanzada 
          y pruebas de conocimiento cero para garantizar la integridad y privacidad de cada voto.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/elections" className="btn btn-primary text-lg px-8">
            Ver Elecciones
          </Link>
          <Link to="/verify" className="btn btn-secondary text-lg px-8">
            Verificar Voto
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
          icon={<Shield className="w-12 h-12 text-primary-600" />}
          title="Máxima Seguridad"
          description="Criptografía de umbral y multi-firma para proteger cada voto"
        />
        <FeatureCard
          icon={<Lock className="w-12 h-12 text-primary-600" />}
          title="Privacidad Total"
          description="Zero-Knowledge Proofs garantizan el anonimato del votante"
        />
        <FeatureCard
          icon={<Check className="w-12 h-12 text-primary-600" />}
          title="Verificable"
          description="Cada votante recibe un comprobante verificable sin revelar su voto"
        />
        <FeatureCard
          icon={<Eye className="w-12 h-12 text-primary-600" />}
          title="Transparente"
          description="Blockchain público permite auditoría completa del proceso"
        />
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-12">¿Cómo Funciona?</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <Step number={1} title="Regístrate" description="Crea tu cuenta con autenticación de dos factores" />
          <Step number={2} title="Verifica" description="Tu identidad es verificada de forma segura" />
          <Step number={3} title="Vota" description="Selecciona tu candidato y confirma tu voto encriptado" />
          <Step number={4} title="Verifica" description="Recibe un comprobante y verifica tu voto en blockchain" />
        </div>
      </section>

      {/* Security Badges */}
      <section className="text-center">
        <h3 className="text-2xl font-bold mb-8">Certificaciones y Seguridad</h3>
        <div className="flex flex-wrap justify-center gap-8">
          <Badge text="ISO 27001" />
          <Badge text="GDPR Compliant" />
          <Badge text="Auditoría Independiente" />
          <Badge text="Blockchain Inmutable" />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div className="px-6 py-3 bg-primary-100 text-primary-900 rounded-full font-semibold">
      {text}
    </div>
  );
}

