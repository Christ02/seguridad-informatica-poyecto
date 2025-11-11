import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="w-6 h-6" />
            <span className="font-semibold">Sistema de Votación Seguro</span>
          </div>

          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} - Todos los derechos reservados
          </div>

          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white">
              Privacidad
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              Términos
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              Seguridad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

