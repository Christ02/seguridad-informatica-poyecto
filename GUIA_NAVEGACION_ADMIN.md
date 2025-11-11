# 🎯 Guía de Navegación - Panel de Administración

## 📝 Páginas Implementadas

Se han implementado **4 páginas completas de administración** con diseños profesionales y funcionales:

---

## 1️⃣ Crear Nueva Elección

**Ruta**: `/admin/elections/create` o `/admin/elections`

### Características:
- ✅ Formulario completo para configurar elecciones
- ✅ Campos: Título, Descripción, Fechas (inicio/fin)
- ✅ Selector de tipo de votación (candidato único, múltiples, clasificada, por aprobación)
- ✅ Toggle de visibilidad
- ✅ Opciones avanzadas (votación anónima, restricciones geográficas)
- ✅ Tabla de elecciones existentes con acciones (editar, eliminar, ver)
- ✅ Búsqueda de elecciones
- ✅ Estados: Activa, Próxima, Finalizada

### Cómo Acceder:
1. Login como admin (email con "admin" o ID: `1234567890`)
2. Click en "Crear Nueva Elección" en el dashboard
3. O navegar a: http://localhost:3000/admin/elections

---

## 2️⃣ Gestionar Candidatos

**Ruta**: `/admin/elections/:id/candidates`

### Características:
- ✅ Lista de candidatos con drag-and-drop para reordenar
- ✅ Avatares o placeholders para fotos
- ✅ Información completa: nombre, descripción, partido/agrupación
- ✅ Formulario lateral para añadir nuevos candidatos
- ✅ Upload de imágenes (SVG, PNG, JPG hasta 800x400px)
- ✅ Acciones inline: editar, eliminar
- ✅ Categorías de partido con badges de colores

### Cómo Acceder:
1. Login como admin
2. Ir a Dashboard > Elecciones
3. Click en "Gestionar" en una elección activa
4. O navegar a: http://localhost:3000/admin/elections/1/candidates

---

## 3️⃣ Gestión de Votantes

**Ruta**: `/admin/voters`

### Características:
- ✅ Tabla completa de votantes registrados
- ✅ Búsqueda avanzada por nombre, DNI, email
- ✅ Estados de identidad: Verificada, Pendiente, Rechazada
- ✅ Estados de cuenta: Activa, Desactivada
- ✅ Participación por votante (ej: 2/3 elecciones)
- ✅ Botón "Importar CSV" para carga masiva
- ✅ Botón "Registrar Votante" individual
- ✅ Acciones: Ver perfil, Vincular, Editar
- ✅ Paginación completa (mostrando 1 a 10 de 97)

### Cómo Acceder:
1. Login como admin
2. Sidebar > Click en "Votantes"
3. O navegar a: http://localhost:3000/admin/voters

---

## 4️⃣ Resultados de Elecciones

**Ruta**: `/admin/results`

### Características:
- ✅ Actualización en vivo ("En vivo: Actualizado hace 2 minutos")
- ✅ Filtros avanzados: Elección, Región/Provincia, Grupo de Edad
- ✅ Exportar a PDF y CSV
- ✅ **Votos por Candidato**:
  - Barras de progreso con porcentajes
  - Conteo de votos individuales
  - Colores distintivos por candidato
- ✅ **Gráfico Donut de Participación**:
  - Visualización circular animada
  - Tasa de participación en el centro
  - Total de votantes vs votos emitidos
- ✅ **Tabla Regional Detallada**:
  - Resultados por región/provincia
  - Votos y porcentajes por candidato
  - Total de votos por región
  - Participación regional
  - Fila de totales nacionales
  - Badges de colores para porcentajes

### Cómo Acceder:
1. Login como admin
2. Sidebar > Click en "Resultados"
3. O navegar a: http://localhost:3000/admin/results

---

## 🔐 Sistema de Autenticación por Roles

### Para Acceder como Administrador:

```
Opción 1 - Email con "admin":
Email: admin@gobierno.gob
Password: cualquier_contraseña

Opción 2 - ID específico:
ID: 1234567890
Password: cualquier_contraseña

Opción 3 - Usuario "admin":
Email: admin
Password: cualquier_contraseña
```

**Resultado**: Redirige automáticamente a `/admin/dashboard`

### Para Acceder como Usuario Normal:

```
ID/Email: 123456789 (cualquier número sin "admin")
Password: cualquier_contraseña
```

**Resultado**: Redirige a `/dashboard` (panel de votante)

---

## 🎨 Diseño y Características

### Componentes Compartidos:
- ✅ **Sidebar de Navegación**: Consistente en todas las páginas
- ✅ **Header con Búsqueda**: Barra de búsqueda global, notificaciones, configuración
- ✅ **User Avatar**: Info del admin con nombre y rol
- ✅ **Responsive Design**: Adaptable a móviles y tablets

### Elementos de UI:
- ✅ Botones con iconos y estados hover
- ✅ Inputs y selects con estilos modernos
- ✅ Toggle switches para opciones booleanas
- ✅ Badges de estado con colores semánticos
- ✅ Tablas con hover effects y acciones inline
- ✅ Modales y formularios laterales
- ✅ Gráficos y visualizaciones de datos

### Estados y Badges:
- 🟢 **Activa** / **Verificada** - Verde
- 🟡 **Próxima** / **Pendiente** - Amarillo
- 🔴 **Rechazada** - Rojo
- ⚪ **Finalizada** / **Desactivada** - Gris

---

## 📊 Datos de Ejemplo

Todas las páginas incluyen datos de ejemplo realistas:

### Elecciones:
- Elecciones Regionales 2023 (Activa)
- Consulta Popular sobre Urbanismo (Finalizada)
- Presupuestos Participativos 2024 (Próxima)

### Candidatos:
- Candidato Alfa (Partido Innovador) - 45%
- Opción Beta (Alianza Social) - 35%
- Alternativa Gamma (Partido Innovador) - 15%

### Votantes:
- María García López - Verificada, Activa
- Juan Martínez Pérez - Pendiente, Activa
- Ana Sánchez Rodríguez - Rechazada, Desactivada

### Resultados:
- Total: 2,501,000 votos
- Participación: 65.2%
- Resultados por 3 regiones

---

## 🛠️ Tecnologías Utilizadas

- **React 18** con TypeScript
- **React Router DOM** para routing
- **Zustand** para gestión de estado
- **CSS Modules** para estilos aislados
- **SVG Icons** inline
- **Responsive Design** con CSS Grid y Flexbox

---

## 🚀 Próximos Pasos

### Funcionalidades Pendientes:
- [ ] Conexión con backend real (actualmente datos mock)
- [ ] Implementar lógica de drag-and-drop funcional
- [ ] Upload real de imágenes con preview
- [ ] Exportación real a PDF/CSV
- [ ] Gráficos interactivos con bibliotecas (Chart.js, Recharts)
- [ ] Filtros funcionales con actualización de datos
- [ ] Paginación funcional con backend
- [ ] Confirmaciones antes de eliminar
- [ ] Validaciones de formularios avanzadas

---

## 📱 Acceso Rápido

### Rutas Principales:

```
Admin Dashboard:     /admin/dashboard
Crear Elección:      /admin/elections/create
Gestionar Candidatos: /admin/elections/1/candidates
Gestión Votantes:    /admin/voters
Resultados:          /admin/results
```

### Comandos Docker:

```bash
# Ver logs del frontend
docker-compose -f docker-compose.dev.yml logs frontend

# Reiniciar frontend
docker-compose -f docker-compose.dev.yml restart frontend

# Ver todos los contenedores
docker-compose -f docker-compose.dev.yml ps
```

---

## 🎯 Testing Manual

### Checklist de Funcionalidades:

#### Crear Elección:
- [ ] Llenar formulario completo
- [ ] Cambiar tipo de votación
- [ ] Activar/desactivar toggles
- [ ] Seleccionar fechas
- [ ] Buscar en tabla de elecciones existentes
- [ ] Click en iconos de editar/eliminar

#### Gestionar Candidatos:
- [ ] Ver lista de candidatos
- [ ] Click en "Añadir Candidato"
- [ ] Llenar formulario de nuevo candidato
- [ ] Simular drag (visualmente preparado)
- [ ] Click en editar candidato
- [ ] Click en eliminar candidato

#### Gestión de Votantes:
- [ ] Buscar votantes
- [ ] Ver badges de estados
- [ ] Click en acciones (ver, vincular, editar)
- [ ] Click en "Importar CSV"
- [ ] Click en "Registrar Votante"
- [ ] Navegar entre páginas de paginación

#### Resultados:
- [ ] Cambiar filtros de elección
- [ ] Cambiar filtros de región
- [ ] Ver animación del donut chart
- [ ] Ver barras de progreso
- [ ] Click en "Exportar PDF"
- [ ] Click en "Exportar CSV"
- [ ] Scroll horizontal en tabla (móvil)

---

## ✅ Estado Actual

```
✅ COMPLETADO - 4 páginas de administración
✅ COMPLETADO - Routing con protección por roles
✅ COMPLETADO - Diseños responsive
✅ COMPLETADO - Componentes reutilizables
✅ COMPLETADO - Estilos profesionales
✅ COMPLETADO - Datos de ejemplo realistas
✅ COMPLETADO - Integración con sidebar
🔄 EN PROGRESO - Conexión con backend
🔄 EN PROGRESO - Funcionalidades interactivas
```

---

**Última actualización**: 11 de Noviembre, 2025  
**Versión**: 2.0.0  
**Estado**: Producción (Frontend) - Mock Data

