# Arquitectura de Seguridad - Sistema de Votación Electrónico

## Resumen Ejecutivo

Este documento describe la arquitectura de seguridad multinivel implementada en el Sistema de Votación Electrónico Seguro, diseñado para garantizar confidencialidad, integridad, disponibilidad y no-repudio en elecciones críticas.

## Principios de Seguridad

### 1. Defense in Depth
Múltiples capas de seguridad en cada nivel:
- **Aplicación**: Validación, sanitización, autenticación
- **Red**: Firewall, WAF, DDoS protection
- **Datos**: Encriptación, segregación, immutabilidad
- **Operacional**: Monitoreo, alertas, respuesta a incidentes

### 2. Zero Trust Architecture
- Nunca confiar, siempre verificar
- Autenticación multi-factor obligatoria
- Mínimo privilegio en todos los niveles
- Microsegmentación de servicios

### 3. Security by Design
- Seguridad desde fase de diseño
- Revisión de seguridad en cada feature
- Threat modeling continuo
- Secure coding practices

### 4. Privacy by Default
- Datos mínimos requeridos
- Separación total identidad-voto
- Zero-knowledge proofs
- Anonymización por defecto

## Arquitectura por Capas

### Capa 1: Perímetro (Edge)

```
Internet
    ↓
Cloudflare (WAF + DDoS Protection)
    ↓
Railway Load Balancer
    ↓
SSL/TLS Termination (Certificate: Let's Encrypt)
```

**Controles de Seguridad:**
- Web Application Firewall (WAF)
  - OWASP Top 10 protection
  - Rate limiting global
  - Geo-blocking (opcional)
  - Bot detection

- DDoS Protection
  - Layer 3/4 protection
  - Layer 7 protection
  - Automatic mitigation
  - Traffic analysis

- TLS/HTTPS
  - TLS 1.3 only
  - Strong cipher suites
  - HSTS enabled
  - Certificate pinning

### Capa 2: Aplicación

```
┌─────────────┐    ┌─────────────┐    ┌──────────────┐
│  Frontend   │───▶│   Backend   │───▶│Crypto Service│
│(React+Vite) │    │(Express+TS) │    │  (Node.js)   │
└─────────────┘    └─────────────┘    └──────────────┘
```

#### Frontend Security

**Controles Implementados:**
1. **Content Security Policy (CSP)**
   ```
   default-src 'self';
   script-src 'self' 'sha256-...';
   style-src 'self' 'unsafe-inline';
   img-src 'self' data: https:;
   connect-src 'self';
   frame-ancestors 'none';
   ```

2. **Subresource Integrity (SRI)**
   - Todos los scripts verificados
   - Hash SHA-384 de cada asset
   - Service Worker para monitoring

3. **Client-Side Encryption**
   - Web Crypto API
   - RSA encryption antes de envío
   - Claves nunca tocan localStorage
   - Memory cleanup después de uso

4. **Anti-CSRF**
   - Tokens únicos por sesión
   - SameSite cookies
   - Double submit pattern

#### Backend Security

**Controles Implementados:**
1. **Authentication & Authorization**
   - JWT con rotación (15 min access, 7 days refresh)
   - 2FA obligatorio (TOTP)
   - Role-Based Access Control (RBAC)
   - Session management en Redis
   - Device fingerprinting

2. **Input Validation**
   - Joi schemas en todos los endpoints
   - Type checking con TypeScript
   - Sanitización de HTML
   - SQL injection prevention (TypeORM)

3. **Rate Limiting**
   - Por IP: 100 req/min
   - Por usuario: 100 req/min
   - Login: 5 intentos/15min
   - Voting: 1/segundo (anti-timing)
   - Backoff exponencial en fallos

4. **Security Headers**
   ```typescript
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   X-XSS-Protection: 1; mode=block
   Strict-Transport-Security: max-age=31536000
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: camera=(), microphone=()
   ```

### Capa 3: Criptografía

#### Threshold Cryptography (3-de-5)

**Arquitectura:**
```
Elección Creada
    ↓
Key Ceremony (5 Custodios)
    ↓
Generar Par RSA 4096-bit
    ↓
Shamir Secret Sharing (threshold=3, shares=5)
    ↓
Distribuir Shares a Custodios
    ↓
Destruir Clave Privada Completa
    ↓
[Solo existe en combinación de 3+ shares]
```

**Propiedades de Seguridad:**
- Clave privada nunca existe completa después de ceremony
- Requiere colusión de 3+ custodios para comprometer
- Shares individuales no revelan información
- Verificable con commitments públicos

**Implementación:**
- `secrets.js-34r7h` para Shamir SS
- `node-forge` para RSA operations
- Shares encriptadas en DB
- Public commitments para verificación

#### Zero-Knowledge Proofs (Schnorr)

**Arquitectura:**
```
Usuario Vota
    ↓
Voto Encriptado → Blockchain
    ↓
Generar Commitment
    ↓
Crear ZK Proof de Inclusión
    ↓
Receipt (no revela voto)
    ↓
Usuario Puede Verificar
```

**Propiedades:**
- Receipt prueba "mi voto está en blockchain"
- NO prueba "así voté" (no-coercible)
- Verificable por cualquiera
- Based en curvas elípticas (secp256k1)

**Protección Anti-Coerción:**
- Receipt no puede usarse para demostrar voto
- Advertencias explícitas al usuario
- Zero-knowledge por diseño

#### Multi-Signature (3/5 o 4/5)

**Operaciones Críticas:**
- Crear elección: 3/5 admins
- Cerrar votación: 3/5 admins
- Iniciar desencriptación: 3/5 admins
- Cancelar elección: 4/5 admins
- Emergency shutdown: 4/5 admins

**Implementación:**
- RSA signatures por admin
- Verificación de todas las firmas
- Transacciones con expiry (24h)
- Audit trail completo

### Capa 4: Datos

#### Segregación de Datos

**Tablas Separadas:**
```
users                    elections
   ↓                         ↓
vote_eligibility      key_shares
(encrypted)           (encrypted)
   ↓                         ↓
   ✗ NO JOIN ✗             ↓
                    blockchain_votes
                    (immutable, encrypted)
```

**Garantías:**
- Imposible join entre identidad y voto
- Diferentes claves de encriptación
- Indices separados
- Queries monitoreadas

#### Encryption at Rest

**PostgreSQL:**
- Conexión SSL obligatoria
- Columnas sensibles: `@Encrypted()` (typeorm-encrypted)
- Algorithm: AES-256-CBC
- Key rotation: quarterly

**Inmutabilidad:**
```sql
-- Trigger para blockchain_votes
CREATE TRIGGER prevent_vote_modification
BEFORE UPDATE OR DELETE ON blockchain_votes
FOR EACH ROW EXECUTE FUNCTION prevent_modification();

-- Trigger para audit_logs
CREATE TRIGGER prevent_audit_modification  
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_modification();
```

#### Blockchain Implementation

**Estructura de Bloque:**
```typescript
{
  index: number,
  timestamp: Date,
  data: EncryptedVote,
  previousHash: string,
  hash: string (SHA-256),
  nonce: number,
  merkleRoot: string,
  validator: string (admin signature)
}
```

**Validación:**
- Hash verification: SHA-256(block) === block.hash
- Chain integrity: previousHash linkage
- Merkle tree: O(log n) proof of inclusion
- Background job: cada 5 min valida cadena completa
- Alertas: cualquier anomalía → SIEM

### Capa 5: Red

#### Network Segmentation

```
DMZ (Public)
│
├─ Frontend (5175)
│
Private Network
│
├─ Backend (3002)
├─ Crypto Service (3003)
├─ Monitoring (3004)
│
Data Layer
│
├─ PostgreSQL (5434)
└─ Redis (6379)
```

**Firewall Rules:**
- Frontend: Internet → 443 only
- Backend: Frontend → 3002 only
- Crypto: Backend → 3003 only
- DB: Backend → 5434 only (SSL)
- Redis: Backend → 6379 only (AUTH)

#### Service Mesh

- mTLS entre servicios
- Service discovery
- Circuit breakers
- Retry policies
- Timeout enforcement

### Capa 6: Operacional

#### Logging & SIEM

**Eventos Loggeados:**
1. Authentication (success/failure)
2. Authorization decisions
3. Admin operations
4. Vote casting
5. Key access
6. Blockchain validation
7. Rate limit violations
8. Security exceptions

**Log Structure:**
```json
{
  "timestamp": "ISO-8601",
  "level": "INFO|WARNING|ERROR|CRITICAL",
  "service": "backend|frontend|crypto",
  "eventType": "SecurityEventType",
  "userId": "uuid (if applicable)",
  "ip": "x.x.x.x",
  "userAgent": "...",
  "action": "...",
  "resource": "...",
  "success": true|false,
  "metadata": {...}
}
```

**SIEM Features:**
- Real-time correlation
- Anomaly detection (ML-based)
- Automated alerting
- Incident creation
- Forensic analysis support

**Immutable Storage:**
- Logs → S3 (write-once)
- Retention: 5 years
- Encrypted at rest
- Integrity verification

#### Monitoring

**Métricas Críticas:**
- Failed auth attempts/min
- Vote submissions/min
- Blockchain validations status
- API latency (p50, p95, p99)
- Database connections
- Redis memory usage
- Error rates
- Anomaly scores

**Alertas:**
- > 10 failed logins/min → WARNING
- Blockchain integrity fail → CRITICAL
- API latency > 1s → WARNING
- Database connection issues → CRITICAL
- Anomaly score > 0.85 → WARNING

#### Incident Response

**Playbooks Implementados:**
1. Breach detection & containment
2. Blockchain compromise
3. DDoS attack mitigation
4. Admin account compromise
5. Data leak response

**CSIRT Team:**
- Security Lead
- System Admin
- DBA
- Network Admin
- Legal Representative

## Threat Model (STRIDE)

### Spoofing
**Mitigación:**
- 2FA obligatorio
- JWT con short TTL
- Device fingerprinting
- Certificate pinning

### Tampering
**Mitigación:**
- Blockchain immutable
- PostgreSQL triggers
- Input validation
- CSP headers

### Repudiation
**Mitigación:**
- Audit logs inmutables
- Digital signatures
- Timestamps confiables
- Non-repudiation receipts

### Information Disclosure
**Mitigación:**
- Encryption at rest/transit
- Segregación de datos
- Zero-knowledge proofs
- Minimal data collection

### Denial of Service
**Mitigación:**
- Rate limiting multinivel
- DDoS protection (Cloudflare)
- Circuit breakers
- Resource limits

### Elevation of Privilege
**Mitigación:**
- RBAC estricto
- Multi-signature para ops críticas
- Least privilege
- Session management

## Compliance

### GDPR
- ✅ Right to access
- ✅ Right to rectification
- ✅ Right to erasure (donde aplique)
- ✅ Data minimization
- ✅ Purpose limitation
- ✅ Storage limitation
- ✅ Integrity and confidentiality

### ISO 27001
- ✅ A.9: Access control
- ✅ A.10: Cryptography
- ✅ A.12: Operations security
- ✅ A.13: Communications security
- ✅ A.14: System acquisition/development
- ✅ A.16: Incident management
- ✅ A.17: Business continuity
- ✅ A.18: Compliance

## Métricas de Seguridad

### KPIs
- **Authentication Success Rate**: > 99%
- **2FA Adoption**: 100%
- **Failed Login Rate**: < 0.1%
- **Blockchain Integrity**: 100%
- **Incident Response Time**: < 15 min
- **Vulnerability Remediation**: < 24h (critical)

### SLAs
- **Availability**: 99.9%
- **RTO**: 4 hours
- **RPO**: 1 hour
- **Data Loss**: 0%

## Auditoría y Certificación

### Requerido Antes de Producción
- [ ] External security audit
- [ ] Penetration testing
- [ ] Code review por security experts
- [ ] Vulnerability assessment
- [ ] Compliance audit
- [ ] Certification ISO 27001 (opcional)

### Auditorías Continuas
- Quarterly security reviews
- Annual penetration tests
- Continuous vulnerability scanning
- Code security analysis (SAST/DAST)

## Conclusión

La arquitectura de seguridad implementada proporciona múltiples capas de protección en cada nivel del sistema, desde el perímetro hasta los datos. La combinación de threshold cryptography, zero-knowledge proofs, y multi-signature garantiza que el sistema es resiliente contra ataques sofisticados mientras mantiene la privacidad del votante.

El diseño prioriza:
1. **Confidencialidad**: Votos encriptados, ZKP, segregación
2. **Integridad**: Blockchain, signatures, inmutabilidad
3. **Disponibilidad**: Redundancia, DDoS protection, backups
4. **No-repudio**: Audit logs, signatures, receipts
5. **Privacy**: ZKP, anonymization, minimal data

---

**Autor**: Christian - Universidad - Curso de Ciberseguridad
**Versión**: 1.0
**Última Actualización**: 2024

