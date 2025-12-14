# Cortex Analytics - Template Projeto Lead Gen

## Estrutura de Diretórios

```
cortex-leadgen-{cliente}/
│
├── README.md
├── .env.example
├── .gitignore
├── requirements.txt
│
├── config/
│   ├── __init__.py
│   ├── settings.py
│   └── client_config.yaml
│
├── src/
│   ├── __init__.py
│   │
│   ├── extractors/
│   │   ├── __init__.py
│   │   ├── base_extractor.py
│   │   ├── meta_ads.py
│   │   ├── google_ads.py
│   │   └── form_webhook.py       # Recebe webhooks de formulários
│   │
│   ├── transformers/
│   │   ├── __init__.py
│   │   ├── leads_transformer.py
│   │   └── campaigns_transformer.py
│   │
│   ├── loaders/
│   │   ├── __init__.py
│   │   └── mysql_loader.py
│   │
│   ├── converters/
│   │   ├── __init__.py
│   │   ├── meta_capi.py
│   │   └── google_ec.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── database.py
│       ├── hashing.py
│       └── notifications.py
│
├── pipelines/
│   ├── __init__.py
│   ├── daily_etl.py
│   └── send_offline_conversions.py
│
├── api/                            # API para receber webhooks
│   ├── __init__.py
│   ├── main.py                     # FastAPI app
│   └── routes/
│       └── webhooks.py
│
├── sql/
│   ├── schema.sql
│   └── views/
│       ├── rpt_daily_leads.sql
│       └── rpt_campaign_performance.sql
│
├── tracking/
│   ├── gtm/
│   │   └── form_tracking_guide.md
│   └── hidden_fields.md            # Como capturar UTMs e cookies
│
├── docs/
│   ├── data_dictionary.md
│   ├── onboarding.md
│   └── webhook_setup.md
│
└── scripts/
    ├── setup_database.sh
    └── test_webhook.py
```

---

## requirements.txt

```
# Core
python-dotenv==1.0.0
pyyaml==6.0.1
pydantic==2.5.0

# API
fastapi==0.104.1
uvicorn==0.24.0

# Database
mysql-connector-python==8.2.0
sqlalchemy==2.0.23

# Ads APIs
requests==2.31.0
facebook-business==19.0.0
google-ads==23.0.0

# Data
pandas==2.1.4

# Scheduling
schedule==1.2.1

# Utilities
python-dateutil==2.8.2
hashlib

# Notifications
slack-sdk==3.23.0
```

---

## config/client_config.yaml

```yaml
client:
  name: "Cliente ABC"
  code: "abc"
  timezone: "America/Sao_Paulo"

ads:
  meta:
    enabled: true
    account_id: "act_123456789"
  google:
    enabled: true
    customer_id: "123-456-7890"

offline_conversions:
  meta_capi:
    enabled: true
    pixel_id: "123456789"
  google_ec:
    enabled: true

landing_pages:
  - name: "LP Principal"
    url: "https://cliente.com.br/lp1"
    type: "form"
  - name: "LP Ebook"
    url: "https://cliente.com.br/ebook"
    type: "ebook"

etl:
  lookback_days: 3
  
alerts:
  slack_channel: "#cortex-abc"
```

---

## api/main.py

```python
"""FastAPI application for receiving form webhooks."""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime
import json

from config.settings import settings
from src.transformers.leads_transformer import LeadsTransformer
from src.loaders.mysql_loader import MySQLLoader

app = FastAPI(title="Cortex Lead Webhook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)


@app.post("/webhook/{client_code}")
async def receive_lead(client_code: str, request: Request):
    """
    Receive lead from form submission.
    
    Expected payload:
    {
        "email": "lead@example.com",
        "phone": "+5511999999999",
        "name": "Nome do Lead",
        "company": "Empresa",
        "utm_source": "facebook",
        "utm_medium": "cpc",
        "utm_campaign": "campanha-xyz",
        "fbc": "fb.1.xxx",
        "fbp": "fb.1.xxx",
        "gclid": "xxx",
        "landing_page": "https://cliente.com.br/lp1",
        "custom_fields": {
            "cargo": "Gerente",
            "segmento": "Varejo"
        }
    }
    """
    try:
        payload = await request.json()
        
        # Log raw submission
        loader = MySQLLoader(client_code)
        loader.insert('raw_form_submissions', [{
            'source': 'webhook',
            'raw_data': json.dumps(payload),
            'extracted_at': datetime.now()
        }])
        
        # Transform and load lead
        transformer = LeadsTransformer(client_code)
        lead = transformer.transform_single(payload)
        
        lead_id = loader.insert('fct_leads', [lead], return_id=True)
        
        logger.info(f"Lead {lead_id} created for {client_code}")
        
        return {
            "status": "success",
            "lead_id": lead_id,
            "message": "Lead received successfully"
        }
        
    except Exception as e:
        logger.error(f"Error processing lead: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
```

---

## src/transformers/leads_transformer.py

```python
"""Transform raw lead data into structured format."""
from datetime import datetime, date
from typing import Dict, Any, Optional
import hashlib

from config.settings import settings


class LeadsTransformer:
    """Transform lead data for loading."""
    
    def __init__(self, client_code: str):
        self.client_code = client_code
    
    def transform_single(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Transform a single lead submission."""
        
        # Hash PII for LGPD compliance
        email_hash = self._hash_value(raw.get('email', '').lower().strip())
        phone_hash = self._hash_value(self._normalize_phone(raw.get('phone', '')))
        
        # Get date key
        now = datetime.now()
        date_key = int(now.strftime('%Y%m%d'))
        
        lead = {
            'date_key': date_key,
            'email_hash': email_hash,
            'phone_hash': phone_hash,
            'name_first': self._extract_first_name(raw.get('name', '')),
            
            # Qualification data
            'company_name': raw.get('company'),
            'job_title': raw.get('cargo') or raw.get('custom_fields', {}).get('cargo'),
            
            # Source tracking
            'utm_source': raw.get('utm_source'),
            'utm_medium': raw.get('utm_medium'),
            'utm_campaign': raw.get('utm_campaign'),
            'utm_content': raw.get('utm_content'),
            'utm_term': raw.get('utm_term'),
            
            # Click IDs
            'fbc': raw.get('fbc'),
            'fbp': raw.get('fbp'),
            'gclid': raw.get('gclid'),
            'ttclid': raw.get('ttclid'),
            'ga_client_id': raw.get('ga_client_id') or raw.get('_ga'),
            
            # Metadata
            'lead_status': 'new',
            'created_at': now,
            
            # Custom fields as JSON or separate columns
            'custom_field_1': raw.get('custom_fields', {}).get('segmento'),
            'custom_field_2': raw.get('custom_fields', {}).get('faturamento'),
        }
        
        # Determine source_id based on UTMs
        lead['source_id'] = self._determine_source_id(
            raw.get('utm_source'),
            raw.get('utm_medium')
        )
        
        return lead
    
    def _hash_value(self, value: str) -> Optional[str]:
        """Create SHA256 hash of a value."""
        if not value:
            return None
        return hashlib.sha256(value.encode()).hexdigest()
    
    def _normalize_phone(self, phone: str) -> str:
        """Normalize phone number to digits only."""
        if not phone:
            return ''
        return ''.join(filter(str.isdigit, phone))
    
    def _extract_first_name(self, full_name: str) -> Optional[str]:
        """Extract first name from full name."""
        if not full_name:
            return None
        return full_name.split()[0] if full_name.split() else None
    
    def _determine_source_id(
        self,
        utm_source: Optional[str],
        utm_medium: Optional[str]
    ) -> int:
        """Determine source_id based on UTM parameters."""
        if not utm_source:
            return 6  # Direct
        
        source_lower = utm_source.lower()
        medium_lower = (utm_medium or '').lower()
        
        if source_lower in ['facebook', 'fb', 'instagram', 'ig', 'meta']:
            return 1  # Meta Ads
        elif source_lower in ['google', 'googleads']:
            return 2  # Google Ads
        elif source_lower == 'tiktok':
            return 3  # TikTok Ads
        elif medium_lower == 'organic':
            return 4  # Organic Search
        elif source_lower in ['linkedin', 'twitter', 'youtube']:
            return 5  # Organic Social
        elif medium_lower == 'email':
            return 8  # Email
        elif medium_lower == 'referral':
            return 7  # Referral
        else:
            return 9  # Other
```

---

## src/converters/meta_capi.py

```python
"""Meta Conversions API sender."""
from datetime import datetime
from typing import Dict, Any, List, Optional
import requests
import hashlib
import time

from config.settings import settings


class MetaCAPIConverter:
    """Send offline conversions to Meta via Conversions API."""
    
    BASE_URL = "https://graph.facebook.com/v18.0"
    
    def __init__(self, pixel_id: str, access_token: str):
        self.pixel_id = pixel_id
        self.access_token = access_token
        self.endpoint = f"{self.BASE_URL}/{pixel_id}/events"
    
    def send_lead_event(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """Send a Lead event to Meta."""
        return self._send_event(
            event_name="Lead",
            event_time=int(lead['created_at'].timestamp()),
            user_data=self._build_user_data(lead),
            custom_data={
                "lead_event_source": "CRM",
                "event_source": "Cortex Analytics"
            },
            event_source_url=lead.get('landing_page_url')
        )
    
    def send_purchase_event(
        self,
        lead: Dict[str, Any],
        value: float,
        currency: str = "BRL"
    ) -> Dict[str, Any]:
        """Send a Purchase event to Meta."""
        return self._send_event(
            event_name="Purchase",
            event_time=int(datetime.now().timestamp()),
            user_data=self._build_user_data(lead),
            custom_data={
                "value": value,
                "currency": currency,
                "event_source": "Cortex Analytics"
            }
        )
    
    def _build_user_data(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """Build user_data object for Meta API."""
        user_data = {}
        
        # Already hashed values
        if lead.get('email_hash'):
            user_data['em'] = [lead['email_hash']]
        if lead.get('phone_hash'):
            user_data['ph'] = [lead['phone_hash']]
        
        # Click IDs (not hashed)
        if lead.get('fbc'):
            user_data['fbc'] = lead['fbc']
        if lead.get('fbp'):
            user_data['fbp'] = lead['fbp']
        
        # Client IP and User Agent if available
        if lead.get('ip_address'):
            user_data['client_ip_address'] = lead['ip_address']
        if lead.get('user_agent'):
            user_data['client_user_agent'] = lead['user_agent']
        
        return user_data
    
    def _send_event(
        self,
        event_name: str,
        event_time: int,
        user_data: Dict[str, Any],
        custom_data: Optional[Dict[str, Any]] = None,
        event_source_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send event to Meta Conversions API."""
        
        event = {
            "event_name": event_name,
            "event_time": event_time,
            "action_source": "system_generated",
            "user_data": user_data
        }
        
        if custom_data:
            event["custom_data"] = custom_data
        if event_source_url:
            event["event_source_url"] = event_source_url
        
        payload = {
            "data": [event],
            "access_token": self.access_token
        }
        
        response = requests.post(self.endpoint, json=payload)
        response.raise_for_status()
        
        return response.json()
    
    def send_batch(
        self,
        events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Send batch of events (up to 1000)."""
        payload = {
            "data": events[:1000],  # Max 1000 per batch
            "access_token": self.access_token
        }
        
        response = requests.post(self.endpoint, json=payload)
        response.raise_for_status()
        
        return response.json()
```

---

## tracking/hidden_fields.md

```markdown
# Configuração de Campos Ocultos para Tracking

Para capturar UTMs e cookies de tracking nos formulários, adicione campos ocultos que são preenchidos via JavaScript.

## Campos Necessários

```html
<!-- UTM Parameters -->
<input type="hidden" name="utm_source" id="utm_source">
<input type="hidden" name="utm_medium" id="utm_medium">
<input type="hidden" name="utm_campaign" id="utm_campaign">
<input type="hidden" name="utm_content" id="utm_content">
<input type="hidden" name="utm_term" id="utm_term">

<!-- Meta Click IDs -->
<input type="hidden" name="fbc" id="fbc">
<input type="hidden" name="fbp" id="fbp">

<!-- Google Click ID -->
<input type="hidden" name="gclid" id="gclid">

<!-- TikTok Click ID -->
<input type="hidden" name="ttclid" id="ttclid">

<!-- Google Analytics Client ID -->
<input type="hidden" name="ga_client_id" id="ga_client_id">
```

## JavaScript para Captura

```javascript
// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    
    // Função para pegar parâmetro da URL
    function getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param) || '';
    }
    
    // Função para pegar cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
    }
    
    // Preencher UTMs
    document.getElementById('utm_source').value = getUrlParam('utm_source');
    document.getElementById('utm_medium').value = getUrlParam('utm_medium');
    document.getElementById('utm_campaign').value = getUrlParam('utm_campaign');
    document.getElementById('utm_content').value = getUrlParam('utm_content');
    document.getElementById('utm_term').value = getUrlParam('utm_term');
    
    // Preencher Meta cookies
    document.getElementById('fbc').value = getCookie('_fbc') || getUrlParam('fbclid');
    document.getElementById('fbp').value = getCookie('_fbp');
    
    // Preencher Google Click ID
    document.getElementById('gclid').value = getUrlParam('gclid');
    
    // Preencher TikTok Click ID
    document.getElementById('ttclid').value = getUrlParam('ttclid');
    
    // Preencher GA Client ID
    if (typeof ga !== 'undefined') {
        ga(function(tracker) {
            document.getElementById('ga_client_id').value = tracker.get('clientId');
        });
    }
});
```

## Integração com Ferramentas de Formulário

### RD Station
Adicionar campos customizados com os mesmos nomes.

### Elementor Forms
Adicionar campos ocultos e usar o hook JavaScript.

### Typeform
Usar Hidden Fields com parâmetros da URL.

### Google Forms
Não suporta nativamente. Usar solução intermediária.

## Webhook para Cortex

Configure o formulário para enviar os dados via webhook para:

```
POST https://api.cortexanalytics.com.br/webhook/{client_code}
```

Payload esperado:
```json
{
    "email": "lead@example.com",
    "phone": "11999999999",
    "name": "Nome Completo",
    "utm_source": "facebook",
    "utm_medium": "cpc",
    "utm_campaign": "campanha-abc",
    "fbc": "fb.1.1234567890.abcdef",
    "fbp": "fb.1.1234567890.abcdef",
    "gclid": "abc123",
    "custom_fields": {
        "cargo": "Gerente"
    }
}
```
```

---

## Checklist Onboarding Lead Gen

```markdown
# Checklist - Onboarding Lead Gen

## Pré-requisitos
- [ ] Contrato assinado
- [ ] Acesso às contas de ads (Meta Business, Google Ads)
- [ ] Acesso ao GTM (ou credenciais para criar)
- [ ] URL das landing pages

## Semana 1: Setup de Tracking

### GTM
- [ ] Criar container GTM (se não existir)
- [ ] Instalar GTM no site/LPs
- [ ] Configurar variáveis de UTM
- [ ] Configurar variáveis de cookies (_fbc, _fbp)

### Formulários
- [ ] Adicionar campos ocultos
- [ ] Configurar JavaScript de captura
- [ ] Configurar webhook para Cortex API
- [ ] Testar submissão de formulário

### Conversões Offline
- [ ] Configurar Meta CAPI
- [ ] Configurar Google Enhanced Conversions
- [ ] Testar eventos de teste

## Semana 2: Integração

### Database
- [ ] Criar Project no Railway
- [ ] Deploy do MySQL
- [ ] Executar schema SQL
- [ ] Configurar variáveis de ambiente

### ETL
- [ ] Deploy da API de webhook
- [ ] Deploy do ETL worker
- [ ] Configurar schedule (cron)
- [ ] Backfill de dados de ads (30 dias)

### Validação
- [ ] Verificar leads chegando
- [ ] Verificar dados de ads
- [ ] Verificar views de report

## Semana 3: Entrega

### Dashboard
- [ ] Configurar dashboard
- [ ] Conectar ao banco
- [ ] Criar visualizações principais
- [ ] Configurar filtros

### Alertas
- [ ] Configurar Slack/Email
- [ ] Definir thresholds
- [ ] Testar alertas

### Treinamento
- [ ] Call de entrega
- [ ] Demonstração do dashboard
- [ ] Explicar métricas
- [ ] Entregar documentação

## Pós-entrega
- [ ] Monitorar 1 semana
- [ ] Ajustar conforme feedback
- [ ] Agendar revisão mensal
```
