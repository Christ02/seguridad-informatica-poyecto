# Plan de Respuesta a Incidentes (IRP)

## Objetivo
Establecer procedimientos claros para detectar, contener, erradicar y recuperarse de incidentes de seguridad en el Sistema de Votación Electrónico.

## Equipo de Respuesta (CSIRT)

### Roles y Responsabilidades

| Rol | Responsable | Contacto | Responsabilidades |
|-----|-------------|----------|-------------------|
| **Security Lead** | [Nombre] | +XX XXX-XXXX | Coordinar respuesta, tomar decisiones críticas |
| **System Admin** | [Nombre] | +XX XXX-XXXX | Gestión de infraestructura, logs, accesos |
| **DBA** | [Nombre] | +XX XXX-XXXX | Base de datos, backups, integridad |
| **Network Admin** | [Nombre] | +XX XXX-XXXX | Firewall, network isolation, traffic analysis |
| **Legal** | [Nombre] | +XX XXX-XXXX | Aspectos legales, comunicación externa |
| **Communications** | [Nombre] | +XX XXX-XXXX | Comunicación con stakeholders |

### Contactos de Emergencia
- **CSIRT Principal**: security@voting-system.com
- **Teléfono 24/7**: +XX XXX-XXXX
- **Slack Channel**: #security-incidents
- **Autoridades**: [Agencia electoral nacional]

## Fases de Respuesta a Incidentes

### Fase 1: Preparación

**Actividades Continuas:**
- Mantener inventario de activos actualizado
- Documentar topología de red y dependencias
- Mantener backups actualizados y probados
- Entrenar al equipo CSIRT trimestralmente
- Realizar simulacros (tabletop exercises) semestralmente
- Mantener playbooks actualizados

**Herramientas y Recursos:**
- SIEM dashboard: http://monitoring.internal/siem
- Logs S3: s3://voting-system-logs/
- Backup location: s3://voting-system-backups/
- Forensic tools: Instalados en jump server
- Communication tools: Slack, Signal (encrypted)

### Fase 2: Detección y Análisis

#### 2.1 Detección de Incidentes

**Fuentes de Detección:**
1. SIEM alerts automáticas
2. Monitoring dashboards (Grafana)
3. User reports
4. External notifications (researchers, authorities)
5. Security scan results
6. Audit log anomalies

**Clasificación de Severidad:**

| Nivel | Criterios | Ejemplo | Tiempo de Respuesta |
|-------|-----------|---------|---------------------|
| **P0 - Crítico** | Impacto masivo en integridad de votos | Blockchain compromised | < 15 min |
| **P1 - Alto** | Múltiples usuarios afectados | Active attack in progress | < 1 hora |
| **P2 - Medio** | Usuario individual comprometido | Single account breach | < 4 horas |
| **P3 - Bajo** | Sin impacto inmediato | Vulnerability discovered | < 24 horas |

#### 2.2 Análisis Inicial

**Checklist de Análisis:**
- [ ] Confirmar que es un incidente real (vs falso positivo)
- [ ] Determinar tipo de incidente (ver taxonomía)
- [ ] Identificar sistemas afectados
- [ ] Estimar alcance y impacto
- [ ] Determinar vector de ataque
- [ ] Identificar indicadores de compromiso (IOCs)
- [ ] Documentar timeline inicial
- [ ] Clasificar severidad

**Documentación:**
```
Incident ID: INC-YYYY-NNNN
Detected: [Timestamp]
Detected by: [Source]
Type: [Tipo de incidente]
Severity: [P0-P3]
Affected Systems: [Lista]
Initial Assessment: [Descripción]
```

### Fase 3: Contención

#### 3.1 Contención Corto Plazo (< 1 hora)

**Acciones Inmediatas:**

**Para Compromiso de Cuentas:**
1. Suspender cuenta afectada
2. Revocar todos los tokens JWT
3. Forzar re-autenticación con 2FA
4. Bloquear IP sospechosa en firewall
5. Activar logs detallados para la cuenta

**Para Ataque en Curso:**
1. Activar rate limiting agresivo
2. Habilitar CAPTCHA en endpoints críticos
3. Bloquear IPs atacantes en Cloudflare
4. Aumentar recursos si es DDoS
5. Notificar a Cloudflare/Railway support

**Para Compromiso de Servidor:**
1. Aislar servidor en red (network segmentation)
2. Capturar snapshot de memoria (forensics)
3. Preservar logs antes de cualquier cambio
4. Bloquear tráfico saliente sospechoso
5. NO apagar servidor (preservar evidencia volátil)

#### 3.2 Contención Largo Plazo

**Acciones Sostenidas:**
1. Rotación de credenciales comprometidas
2. Implementar reglas WAF específicas
3. Parchear vulnerabilidad explotada
4. Fortalecer monitoreo en área afectada
5. Preparar comunicación a usuarios (si aplica)

### Fase 4: Erradicación

**Objetivo:** Eliminar completamente la amenaza del entorno.

**Pasos:**
1. **Identificar Causa Raíz**
   - Análisis de logs completo
   - Forensic analysis de sistemas comprometidos
   - Code review si es vulnerabilidad

2. **Remover Artefactos Maliciosos**
   - Eliminar backdoors
   - Remover malware/scripts
   - Limpiar cuentas comprometidas

3. **Parchear Vulnerabilidades**
   - Aplicar parches de seguridad
   - Actualizar dependencias
   - Modificar configuraciones inseguras

4. **Fortalecer Defensas**
   - Implementar controles adicionales
   - Mejorar detección para este tipo de ataque
   - Actualizar playbooks

### Fase 5: Recuperación

**Objetivo:** Restaurar sistemas a operación normal segura.

**Proceso de Recuperación:**

1. **Verificar Limpieza**
   - Scan completo de seguridad
   - Validar integridad de datos
   - Confirmar no persistencia de amenaza

2. **Restaurar Servicios**
   - Restaurar desde backups limpios (si necesario)
   - Validar integridad del blockchain
   - Verificar que key shares no comprometidas
   - Re-generar claves si fue comprometido crypto

3. **Monitoreo Intensivo**
   - 24/7 monitoring durante 72 horas
   - Alertas para IOCs específicos
   - Análisis de comportamiento anómalo

4. **Validación**
   - Tests de penetración
   - Vulnerability scan completo
   - Code review de cambios
   - Smoke tests de funcionalidad

5. **Comunicación**
   - Notificar a usuarios afectados
   - Reportar a autoridades (si requerido)
   - Actualizar status page

### Fase 6: Post-Incident Activity

#### 6.1 Lessons Learned Meeting

**Agenda (dentro de 72 horas post-resolución):**
1. Timeline completo del incidente
2. Qué funcionó bien
3. Qué necesita mejora
4. Acciones correctivas
5. Actualización de playbooks

**Participantes:**
- Todo el CSIRT
- Management
- Stakeholders afectados

#### 6.2 Documentación Final

**Incident Report Completo:**
```markdown
# Incident Report: INC-YYYY-NNNN

## Executive Summary
[Resumen en 2-3 párrafos]

## Timeline
[Timeline detallado con timestamps]

## Root Cause Analysis
[Análisis de causa raíz]

## Impact Assessment
- Users affected: [N]
- Systems affected: [Lista]
- Data compromised: [Si/No/Detalles]
- Financial impact: [Estimado]
- Reputation impact: [Evaluación]

## Response Actions Taken
[Lista detallada]

## Effectiveness of Response
[Evaluación]

## Lessons Learned
[Lista]

## Recommendations
[Lista priorizada]

## Follow-up Actions
[Lista con responsables y deadlines]
```

#### 6.3 Acciones de Seguimiento

**Actualizaciones Requeridas:**
- [ ] Actualizar SIEM rules
- [ ] Actualizar playbooks
- [ ] Actualizar training materials
- [ ] Implementar controles adicionales
- [ ] Realizar simulacro del escenario
- [ ] Revisar con legal/compliance
- [ ] Actualizar threat model
- [ ] Comunicar lessons learned al equipo

## Playbooks por Tipo de Incidente

### Referencias a Playbooks Específicos:
1. [Breach Detection Playbook](./playbooks/breach-detection.md)
2. [Blockchain Compromise Playbook](./playbooks/blockchain-compromise.md)
3. [DDoS Attack Playbook](./playbooks/ddos-attack.md)
4. [Admin Compromise Playbook](./playbooks/admin-compromise.md)
5. [Data Leak Playbook](./playbooks/data-leak.md)
6. [Ransomware Playbook](./playbooks/ransomware.md)
7. [Insider Threat Playbook](./playbooks/insider-threat.md)

## Comunicación Durante Incidentes

### Matriz de Comunicación

| Severidad | Stakeholders | Timeframe | Canal |
|-----------|--------------|-----------|-------|
| P0 | CEO, CTO, CISO, Legal | Inmediato | Phone + Signal |
| P0 | Autoridades | < 1 hora | Official channels |
| P0 | Usuarios | < 4 horas | Email + Status page |
| P1 | Management | < 2 horas | Slack + Email |
| P1 | Usuarios afectados | < 8 horas | Email |
| P2-P3 | Equipo técnico | < 24 horas | Slack |

### Templates de Comunicación

#### Internal Alert (P0)
```
SECURITY INCIDENT - P0 CRITICAL

Incident ID: INC-YYYY-NNNN
Detected: [Timestamp]
Type: [Type]
Status: [ACTIVE/CONTAINED/RESOLVED]

IMMEDIATE ACTIONS REQUIRED:
- [Action 1]
- [Action 2]

War Room: https://meet.voting-system.com/incident-NNNN
CSIRT Lead: [Name] - [Phone]

DO NOT discuss externally until cleared by Communications team.
```

#### External Communication (Users)
```
Subject: Security Notification - [Brief Description]

Dear Voting System Users,

We are writing to inform you of a security incident that may have affected your account.

WHAT HAPPENED:
[Clear, non-technical explanation]

WHAT WE'RE DOING:
[Actions taken]

WHAT YOU SHOULD DO:
- [Action 1]
- [Action 2]

We take security seriously and apologize for any inconvenience.

For questions: security@voting-system.com
Status updates: status.voting-system.com

Sincerely,
[Name]
Chief Security Officer
```

## Métricas y KPIs

### Métricas de Respuesta
- **MTTD** (Mean Time To Detect): < 5 min
- **MTTA** (Mean Time To Acknowledge): < 15 min
- **MTTC** (Mean Time To Contain): < 1 hora (P0)
- **MTTR** (Mean Time To Resolve): < 24 horas (P0)

### Reporting
- Incidentes mensuales: Executive summary
- Incidentes críticos (P0/P1): Immediate report
- Métricas trimestrales: Board presentation
- Audit anual: Compliance reporting

## Aspectos Legales

### Obligaciones de Reporte
- **GDPR**: < 72 horas si hay breach de datos personales
- **Autoridades electorales**: Inmediato si afecta integridad
- **Law enforcement**: Según severidad y jurisdicción

### Preservación de Evidencia
- Chain of custody documentation
- Forensic images de sistemas comprometidos
- Logs inmutables (S3)
- Screenshots y timeline
- Comunicaciones del equipo

## Contactos de Apoyo

### Vendors Críticos
- **Railway**: support@railway.app
- **Cloudflare**: [Support number]
- **AWS**: [Support number]

### Servicios Externos
- **Forensics**: [Firma contratada]
- **Legal**: [Firma contratada]
- **PR**: [Firma contratada]

---

**Versión**: 1.0
**Última Actualización**: 2024
**Próxima Revisión**: Trimestral
**Aprobado por**: CISO

