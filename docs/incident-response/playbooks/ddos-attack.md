# Playbook: Ataque DDoS

## Detección

### Síntomas
- Latencia anormalmente alta (> 5s)
- Error rate > 10%
- CPU/bandwidth al 100%
- Imposibilidad de acceder al sitio
- SIEM: Spike de tráfico de IPs únicas
- Cloudflare: DDoS detected alert

### Verificación
```bash
# Check current traffic
railway logs --tail 100

# Check error rates
curl -s http://monitoring/api/metrics | grep error_rate

# Check Cloudflare analytics
# Via dashboard: analytics.cloudflare.com
```

## Clasificación

| Tipo | Características | Severidad |
|------|----------------|-----------|
| **Layer 3/4** | SYN flood, UDP flood | P1 - Auto-mitigated |
| **Layer 7** | HTTP flood, Slowloris | P0 - Requiere acción |
| **Application** | API abuse, search flood | P1 - Configurable |

## Contención Inmediata

### 1. Activar Under Attack Mode (Cloudflare)
```bash
# Via CLI o dashboard
# Security → Settings → Security Level → "Under Attack"
```
**Efecto:** Challenge page para todos los visitantes, filtra bots

### 2. Rate Limiting Agresivo
```bash
# Backend
redis-cli
> CONFIG SET maxmemory-policy allkeys-lru
> SET rate_limit:global 10  # 10 req/sec globally

# Update application
export RATE_LIMIT_MULTIPLIER=0.1
railway restart
```

### 3. Geo-blocking (si aplica)
```bash
# Cloudflare
# Security → WAF → Firewall Rules
# (country.code ne "MX" and country.code ne "US") → Challenge
```

### 4. Escalar Recursos
```bash
# Railway - aumentar replicas
railway scale --replicas 5

# Aumentar database connections
railway variables set DB_MAX_CONNECTIONS=50
```

## Análisis

### Identificar Patrones
```bash
# Analizar logs
aws s3 cp s3://voting-logs/$(date +%Y-%m-%d)/ ./logs/ --recursive

# Top attacking IPs
cat logs/* | grep 429 | awk '{print $1}' | sort | uniq -c | sort -rn | head -20

# User agents
cat logs/* | grep "User-Agent" | sort | uniq -c | sort -rn | head -10

# Request patterns
cat logs/* | awk '{print $7}' | sort | uniq -c | sort -rn | head -20
```

### Clasificar Ataque

**Volumétrico:**
- > 1M requests/hour
- Distribuido (muchas IPs)
- User agents variados

**Botnet:**
- IPs en rangos específicos
- User agents similares
- Patrones de timing regulares

**Amplification:**
- Respuestas grandes
- Bandwidth > request count
- IPs spoofed

## Mitigación

### Layer 7 (Application)

**WAF Rules (Cloudflare):**
```
# Block suspicious user agents
(http.user_agent contains "bot" and not http.user_agent contains "Googlebot")

# Block rapid requests from single IP
(ip.src.country ne "MX" and cf.threat_score > 50)

# Protect specific endpoints
(http.request.uri.path eq "/api/v1/votes" and cf.bot_management.score < 30)

# Challenge high-risk requests
(http.request.method eq "POST" and not cf.bot_management.verified_bot)
```

**Application-Level:**
```typescript
// Backend - implement CAPTCHA
if (rateLimitExceeded(ip) && !verifyCaptcha(request)) {
  return res.status(429).json({ error: 'Please complete CAPTCHA' });
}

// Implement request signatures
if (!verifyRequestSignature(request)) {
  return res.status(403).json({ error: 'Invalid request signature' });
}

// Token bucket algorithm
const bucket = getOrCreateBucket(userId);
if (!bucket.tryConsume(1)) {
  return res.status(429).json({ 
    error: 'Rate limit exceeded',
    retryAfter: bucket.getRetryAfter()
  });
}
```

### Layer 3/4 (Network)

**Usually auto-mitigated by Cloudflare, but:**
```bash
# Verify protection is active
curl -s https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/ddos \
  -H "Authorization: Bearer ${CF_API_TOKEN}"

# Should return: "value": "on"
```

### Database Protection

```sql
-- Limit connections per IP
ALTER SYSTEM SET max_connections_per_client = 5;

-- Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < NOW() - INTERVAL '30 seconds';

-- Temporary read-only mode (if critical)
ALTER DATABASE voting_system SET default_transaction_read_only = on;
```

## Recuperación

### 1. Gradual De-escalation
```bash
# After attack subsides (30+ min of normal traffic)

# Step 1: Reduce rate limit from 0.1x to 0.5x
export RATE_LIMIT_MULTIPLIER=0.5

# Step 2: Change Cloudflare from "Under Attack" to "High"

# Step 3: Remove geo-blocking

# Step 4: Scale down resources
railway scale --replicas 2

# Step 5: Return to normal rate limits
export RATE_LIMIT_MULTIPLIER=1.0
```

### 2. Validate Functionality
```bash
# Run smoke tests
curl -f https://voting-system.com/health

# Check key endpoints
./scripts/smoke-tests.sh

# Verify database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### 3. Monitor for Resumption
```bash
# Watch metrics for 24h
watch -n 60 'curl -s http://monitoring/api/metrics | jq .'

# Set alert for traffic spike
# SIEM → Create alert: traffic > baseline * 3
```

## Post-Incident

### Análisis
- Total requests blocked: [N]
- Duration: [X hours]
- Peak traffic: [X req/sec]
- Top attacking IPs: [List]
- Attack vector: [Layer X, Type Y]
- Estimated cost: $[X] (if any)

### Mejoras Implementar
- [ ] Fine-tune WAF rules based on patterns
- [ ] Implement request signing for API
- [ ] Add CAPTCHA to critical forms
- [ ] Improve monitoring alerts
- [ ] Document attack signatures
- [ ] Update playbook with learnings

### Comunicación
```
Subject: DDoS Attack - Resolution Notice

The DDoS attack that affected our service between [START] and [END] 
has been fully mitigated. All systems are operating normally.

Impact: [Description]
Actions Taken: [Summary]

No user data was compromised. All votes submitted during the attack 
were successfully processed and stored securely.

We have implemented additional protections to prevent similar attacks.

Thank you for your patience.
```

## Prevención Futura

### Cloudflare Settings
- ✅ DDoS protection: Enabled (automatic)
- ✅ Bot Fight Mode: Enabled
- ✅ Rate limiting rules: Configured
- ✅ WAF managed rules: Enabled
- ✅ Challenge Passage: 30 minutes

### Application Hardening
- ✅ Request signing
- ✅ CAPTCHA integration
- ✅ Token bucket rate limiting
- ✅ Connection pooling
- ✅ Query optimization

### Monitoring
- ✅ Traffic baseline established
- ✅ Anomaly detection active
- ✅ Auto-scaling configured
- ✅ Alerts tuned

---

**Última actualización**: [Date]
**Testado**: [Date]
**Próxima revisión**: Trimestral

