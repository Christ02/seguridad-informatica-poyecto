# Threat Model - Sistema de Votación Electrónico

## Análisis STRIDE Completo

### Metodología
Este threat model utiliza la metodología STRIDE de Microsoft para identificar amenazas en cada componente del sistema.

## Componentes Analizados

### 1. Frontend (React Application)

#### Spoofing Identity
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Phishing del sitio de votación | Alto | Media | Certificate pinning, domain verification, user education |
| Session hijacking | Alto | Baja | HttpOnly cookies, HTTPS only, short TTL |
| Man-in-the-middle | Crítico | Baja | TLS 1.3, HSTS, certificate transparency |

#### Tampering
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Modificación del código JavaScript | Crítico | Media | SRI hashes, CSP, integrity monitoring |
| Tampering con voto antes de encriptar | Crítico | Baja | Client-side validation, integrity checks |
| XSS injection | Alto | Media | CSP, input sanitization, output encoding |

#### Repudiation
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Usuario niega haber votado | Medio | Media | Receipt system, audit logs |
| Admin niega cambios | Alto | Baja | Immutable audit logs, signatures |

#### Information Disclosure
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Memory dumps revelan voto | Alto | Baja | Memory cleanup, encryption |
| LocalStorage/SessionStorage leak | Medio | Media | No sensitive data in storage |
| Browser history leak | Bajo | Alta | No sensitive data in URLs |

#### Denial of Service
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Client-side resource exhaustion | Medio | Media | Web Workers, timeout limits |
| CDN DDoS | Alto | Media | Cloudflare protection, caching |

#### Elevation of Privilege
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Admin panel access sin autorización | Crítico | Baja | RBAC, server-side checks |
| Bypass de 2FA en cliente | Crítico | Muy Baja | Server-side enforcement |

---

### 2. Backend API (Express + Node.js)

#### Spoofing Identity
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| JWT forgery | Crítico | Muy Baja | Strong secret (256-bit), signature verification |
| Admin impersonation | Crítico | Baja | Multi-factor auth, multi-signature |
| API key theft | Alto | Media | Secure storage, rotation, monitoring |

#### Tampering
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| SQL injection | Crítico | Muy Baja | TypeORM parameterized queries |
| Request tampering | Alto | Baja | Request signing, HMAC verification |
| Middleware bypass | Alto | Baja | Proper ordering, comprehensive tests |

#### Repudiation
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Admin niega acción crítica | Crítico | Baja | Immutable logs, multi-sig, signatures |
| System niega recibir voto | Alto | Muy Baja | Receipts, blockchain, audit trail |

#### Information Disclosure
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Database credential leak | Crítico | Baja | Env vars, secrets management, no hardcoding |
| Error messages revelan estructura | Medio | Alta | Generic error messages, log only server-side |
| Timing attacks en votación | Alto | Media | Constant-time operations, randomized delays |

#### Denial of Service
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| API flooding | Alto | Alta | Rate limiting (Redis), backoff exponential |
| Database connection exhaustion | Alto | Media | Connection pooling, max connections |
| Crypto operations DoS | Medio | Media | Queue system, timeout limits |

#### Elevation of Privilege
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| RBAC bypass | Crítico | Baja | Middleware enforcement, comprehensive tests |
| Parameter tampering | Alto | Media | Server-side validation, type checking |
| Mass assignment | Medio | Baja | Explicit field whitelisting |

---

### 3. Crypto Service

#### Spoofing Identity
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Unauthorized access to key shares | Crítico | Baja | mTLS, API keys, network isolation |
| Impersonation of backend | Alto | Baja | Certificate verification, mutual auth |

#### Tampering
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Manipulation of threshold params | Crítico | Muy Baja | Immutable config, signed parameters |
| Share tampering | Crítico | Muy Baja | Public commitments, verification |
| ZKP forgery | Alto | Muy Baja | Cryptographic verification, protocol soundness |

#### Repudiation
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Custodian niega participación | Alto | Baja | Signed operations, audit trail |
| Service niega operación crypto | Medio | Muy Baja | Comprehensive logging |

#### Information Disclosure
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Key share leakage | Crítico | Muy Baja | Encryption at rest, secure memory |
| Side-channel attacks | Alto | Baja | Constant-time crypto, no timing leaks |
| Memory dumps | Alto | Baja | Memory encryption, key zeroization |

#### Denial of Service
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Crypto operation flooding | Medio | Media | Rate limiting, queue management |
| Key ceremony disruption | Alto | Baja | Timeout handling, retry logic |

#### Elevation of Privilege
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Access to other elections' keys | Crítico | Muy Baja | Strict isolation, access control |
| Bypass threshold requirement | Crítico | Muy Baja | Cryptographic enforcement |

---

### 4. PostgreSQL Database

#### Spoofing Identity
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Credential theft | Crítico | Media | Strong passwords, rotation, secrets management |
| Connection hijacking | Alto | Baja | SSL/TLS, certificate verification |

#### Tampering
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Vote modification | Crítico | Muy Baja | Immutable triggers, PostgreSQL rules |
| Audit log tampering | Crítico | Muy Baja | Append-only, triggers, checksums |
| Schema modification | Alto | Baja | Migration control, restricted privileges |

#### Repudiation
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Database niega transacción | Medio | Muy Baja | Transaction logs, WAL archiving |

#### Information Disclosure
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Backup theft | Crítico | Media | Encrypted backups, secure storage |
| Memory dumps | Alto | Baja | Encrypted connections, no sensitive data in logs |
| Join attack (identity + vote) | Crítico | Muy Baja | Segregated tables, no foreign keys |

#### Denial of Service
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Query bombing | Alto | Media | Connection limits, query timeout |
| Storage exhaustion | Alto | Media | Monitoring, cleanup jobs, quotas |
| Lock contention | Medio | Media | Optimized queries, proper indexing |

#### Elevation of Privilege
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| SQL injection to admin | Crítico | Muy Baja | Parameterized queries, ORM |
| Role escalation | Alto | Baja | Principle of least privilege |

---

### 5. Redis (Sessions & Cache)

#### Spoofing Identity
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Session token theft | Alto | Media | HttpOnly cookies, short TTL, rotation |
| Unauthorized Redis access | Alto | Baja | AUTH password, network isolation |

#### Tampering
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Session manipulation | Alto | Baja | HMAC signatures, server-side validation |
| Cache poisoning | Medio | Media | Input validation, TTL limits |

#### Repudiation
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Session activity denial | Bajo | Media | Additional logging to persistent storage |

#### Information Disclosure
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Session data leakage | Alto | Baja | Minimal data in sessions, encryption |
| Memory dump | Medio | Baja | Network isolation, access control |

#### Denial of Service
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Memory exhaustion | Alto | Media | Memory limits, eviction policies |
| Connection flooding | Medio | Media | Connection limits, monitoring |

#### Elevation of Privilege
| Amenaza | Impacto | Probabilidad | Mitigación |
|---------|---------|--------------|------------|
| Session hijacking to admin | Alto | Baja | Device fingerprinting, IP validation |

---

## Attack Trees

### Attack: Manipular Resultado de Elección

```
Manipular Resultado Final
├── Modificar Votos en Blockchain [DIFÍCIL]
│   ├── Obtener acceso a DB [MEDIO]
│   │   ├── SQL Injection [MUY DIFÍCIL - Mitigado]
│   │   └── Credential Theft [DIFÍCIL - Env vars]
│   └── Bypass immutability triggers [MUY DIFÍCIL]
│
├── Inyectar Votos Falsos [DIFÍCIL]
│   ├── Bypass eligibility check [DIFÍCIL]
│   │   ├── Duplicate voter [MUY DIFÍCIL - DB constraints]
│   │   └── Forge JWT [MUY DIFÍCIL - Strong secret]
│   └── Bypass encryption [MUY DIFÍCIL - RSA 4096]
│
└── Comprometer Decryption [MUY DIFÍCIL]
    ├── Obtener 3+ key shares [MUY DIFÍCIL]
    │   ├── Compromise custodians [MUY DIFÍCIL]
    │   └── Social engineering [DIFÍCIL]
    └── Bypass multi-sig [MUY DIFÍCIL - 3/5 required]
```

**Conclusión**: Attack path más viable requiere comprometer 3+ custodios + 3+ admins, lo cual es extremadamente difícil y altamente detectable.

### Attack: Revelar Cómo Votó Un Usuario

```
Revelar Voto de Usuario X
├── Join identidad con voto [MUY DIFÍCIL]
│   ├── Query database join [IMPOSIBLE - No FK, segregado]
│   └── Timing analysis [DIFÍCIL - Random delays]
│
├── Interceptar voto antes de encriptar [DIFÍCIL]
│   ├── XSS attack [DIFÍCIL - CSP, SRI]
│   ├── Man-in-the-middle [MUY DIFÍCIL - TLS, pinning]
│   └── Malware en cliente [FUERA DE SCOPE]
│
└── Comprometer encryption [MUY DIFÍCIL]
    ├── Obtener private key [MUY DIFÍCIL - Threshold]
    │   ├── 3+ key shares [MUY DIFÍCIL]
    │   └── Break RSA 4096 [IMPOSIBLE - Estado actual]
    └── Identify voto en blockchain [MUY DIFÍCIL - No metadata]
```

**Conclusión**: Sistema diseñado específicamente para prevenir este ataque. Múltiples capas de protección hacen extremadamente difícil o imposible.

---

## Risk Assessment Matrix

| Amenaza | Probabilidad | Impacto | Risk Score | Prioridad |
|---------|--------------|---------|------------|-----------|
| Admin key compromise | Baja | Crítico | Alto | P1 |
| Database breach | Baja | Crítico | Alto | P1 |
| DDoS attack | Alta | Alto | Alto | P1 |
| XSS vulnerability | Media | Alto | Medio | P2 |
| Session hijacking | Baja | Alto | Medio | P2 |
| Timing attacks | Media | Medio | Medio | P3 |
| Phishing | Alta | Medio | Medio | P3 |
| Client malware | Alta | Alto | Alto | P1* |

*P1 pero out-of-scope (responsabilidad del usuario)

---

## Mitigaciones Prioritarias

### Crítico (P0)
1. ✅ Threshold cryptography implementada
2. ✅ Multi-signature para ops críticas
3. ✅ Segregación completa de datos
4. ✅ Immutabilidad en blockchain y audit logs

### Alto (P1)
1. ✅ 2FA obligatorio
2. ✅ Rate limiting multinivel
3. ✅ DDoS protection (Cloudflare)
4. ✅ Encryption at rest
5. ⏳ External security audit (pre-producción)

### Medio (P2)
1. ✅ CSP y SRI
2. ✅ Session management robusto
3. ✅ Comprehensive logging
4. ⏳ Penetration testing (pre-producción)

### Bajo (P3)
1. ✅ Security awareness training
2. ⏳ Bug bounty program (post-lanzamiento)

---

## Supuestos y Limitaciones

### Supuestos de Seguridad
1. Custodios no coluden (< 3 comprometidos)
2. Admins no coluden (< 3 comprometidos)
3. PostgreSQL y Redis son seguros y actualizados
4. TLS/SSL no está comprometido
5. Hardware del servidor no está comprometido

### Limitaciones Conocidas
1. **Client-side malware**: Fuera de control del sistema
2. **Social engineering**: Responsabilidad del usuario
3. **Physical access**: Asumimos datacenter seguro
4. **Insider threats**: Mitigados pero no eliminados completamente
5. **Quantum computing**: RSA vulnerable en futuro (20-30 años)

### Futuras Mejoras
1. Post-quantum cryptography (preparación)
2. Hardware Security Modules (HSM) para key shares
3. Biometric authentication (opcional)
4. Blockchain público (Ethereum/Polygon) para mayor transparencia

---

## Conclusión

El threat model identifica las amenazas principales y confirma que las mitigaciones implementadas proporcionan defensa adecuada contra ataques realistas. Los attack paths más críticos (manipular resultados, revelar votos) son extremadamente difíciles o imposibles con las salvaguardas actuales.

**Risk Residual Aceptable**: Sí, para un sistema de votación de nivel producción.

**Recomendación**: Proceder con auditoría externa y penetration testing antes de despliegue en producción real.

---

**Autor**: Christian - Universidad - Curso de Ciberseguridad
**Versión**: 1.0
**Fecha**: 2024

