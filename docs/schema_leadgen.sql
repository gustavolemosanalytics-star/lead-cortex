-- ============================================================
-- CORTEX ANALYTICS - SCHEMA LEAD GENERATION
-- Versão: 1.0
-- Banco: MySQL 8.0+
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- TABELAS DE DIMENSÃO
-- ============================================================

-- -----------------------------------------------------
-- dim_dates - Calendário (mesmo do e-commerce)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dim_dates (
    date_key INT PRIMARY KEY,
    full_date DATE NOT NULL UNIQUE,
    day_of_week TINYINT NOT NULL,
    day_of_week_name VARCHAR(20) NOT NULL,
    day_of_month TINYINT NOT NULL,
    day_of_year SMALLINT NOT NULL,
    week_of_year TINYINT NOT NULL,
    month_number TINYINT NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    quarter TINYINT NOT NULL,
    year SMALLINT NOT NULL,
    is_weekend BOOLEAN NOT NULL DEFAULT FALSE,
    is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
    
    INDEX idx_full_date (full_date),
    INDEX idx_year_month (year, month_number)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- dim_campaigns - Campanhas de Ads
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dim_campaigns (
    campaign_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    platform VARCHAR(50) NOT NULL,
    platform_account_id VARCHAR(100) NULL,
    platform_campaign_id VARCHAR(100) NOT NULL,
    platform_adset_id VARCHAR(100) NULL,
    platform_ad_id VARCHAR(100) NULL,
    
    campaign_name VARCHAR(500) NULL,
    adset_name VARCHAR(500) NULL,
    ad_name VARCHAR(500) NULL,
    
    campaign_objective VARCHAR(100) NULL,
    campaign_type VARCHAR(100) NULL,
    funnel_stage VARCHAR(50) NULL,
    
    utm_source VARCHAR(100) NULL,
    utm_medium VARCHAR(100) NULL,
    utm_campaign VARCHAR(255) NULL,
    utm_content VARCHAR(255) NULL,
    utm_term VARCHAR(255) NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    first_seen_date DATE NULL,
    last_seen_date DATE NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_platform_ids (platform, platform_campaign_id, platform_adset_id, platform_ad_id),
    INDEX idx_platform_campaign (platform, platform_campaign_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- dim_landing_pages - Landing Pages
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dim_landing_pages (
    landing_page_id INT PRIMARY KEY AUTO_INCREMENT,
    page_url VARCHAR(500) NOT NULL,
    page_name VARCHAR(200) NULL,
    page_type VARCHAR(50) NULL,              -- form, quiz, webinar, ebook, etc
    offer_name VARCHAR(200) NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_url (page_url(255))
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- dim_lead_sources - Fontes de Lead
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dim_lead_sources (
    source_id INT PRIMARY KEY AUTO_INCREMENT,
    source_name VARCHAR(100) NOT NULL,       -- Meta Ads, Google Ads, Organic, Direct
    source_type VARCHAR(50) NULL,            -- Paid, Organic, Direct
    is_paid BOOLEAN DEFAULT FALSE,
    
    UNIQUE INDEX idx_source_name (source_name)
) ENGINE=InnoDB;

INSERT INTO dim_lead_sources (source_name, source_type, is_paid) VALUES
('Meta Ads', 'Paid', TRUE),
('Google Ads', 'Paid', TRUE),
('TikTok Ads', 'Paid', TRUE),
('Organic Search', 'Organic', FALSE),
('Organic Social', 'Organic', FALSE),
('Direct', 'Direct', FALSE),
('Referral', 'Organic', FALSE),
('Email', 'Owned', FALSE),
('Other', 'Other', FALSE);

-- ============================================================
-- TABELAS DE FATO
-- ============================================================

-- -----------------------------------------------------
-- fct_leads - Leads capturados
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS fct_leads (
    lead_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    external_lead_id VARCHAR(100) NULL,      -- ID do CRM/formulário
    date_key INT NOT NULL,
    
    -- Dados do lead (hasheados para LGPD)
    email_hash VARCHAR(64) NULL,
    phone_hash VARCHAR(64) NULL,
    name_first VARCHAR(100) NULL,            -- Pode manter primeiro nome
    
    -- Dados de qualificação
    company_name VARCHAR(200) NULL,
    job_title VARCHAR(200) NULL,
    company_size VARCHAR(50) NULL,
    industry VARCHAR(100) NULL,
    
    -- Campos customizados (flexível)
    custom_field_1 VARCHAR(500) NULL,
    custom_field_2 VARCHAR(500) NULL,
    custom_field_3 VARCHAR(500) NULL,
    
    -- Origem
    landing_page_id INT NULL,
    source_id INT NULL,
    campaign_id BIGINT NULL,
    
    -- UTMs capturados no formulário
    utm_source VARCHAR(100) NULL,
    utm_medium VARCHAR(100) NULL,
    utm_campaign VARCHAR(255) NULL,
    utm_content VARCHAR(255) NULL,
    utm_term VARCHAR(255) NULL,
    
    -- Cookies de tracking
    fbc VARCHAR(255) NULL,
    fbp VARCHAR(255) NULL,
    gclid VARCHAR(255) NULL,
    ttclid VARCHAR(255) NULL,
    ga_client_id VARCHAR(100) NULL,
    
    -- Status do funil
    lead_status VARCHAR(50) DEFAULT 'new',   -- new, contacted, qualified, unqualified, converted, lost
    lead_score INT NULL,                     -- Score de qualidade 0-100
    
    -- Datas do funil
    created_at DATETIME NOT NULL,
    contacted_at DATETIME NULL,
    qualified_at DATETIME NULL,
    converted_at DATETIME NULL,
    
    -- Valores (se converteu)
    deal_value DECIMAL(14,2) NULL,
    
    -- Metadados
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    device_type VARCHAR(50) NULL,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date (date_key),
    INDEX idx_email (email_hash),
    INDEX idx_source (source_id),
    INDEX idx_campaign (campaign_id),
    INDEX idx_landing_page (landing_page_id),
    INDEX idx_status (lead_status),
    INDEX idx_created (created_at),
    INDEX idx_gclid (gclid),
    INDEX idx_fbc (fbc),
    
    FOREIGN KEY (date_key) REFERENCES dim_dates(date_key),
    FOREIGN KEY (landing_page_id) REFERENCES dim_landing_pages(landing_page_id),
    FOREIGN KEY (source_id) REFERENCES dim_lead_sources(source_id),
    FOREIGN KEY (campaign_id) REFERENCES dim_campaigns(campaign_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- fct_ad_spend - Gastos com Ads
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS fct_ad_spend (
    spend_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date_key INT NOT NULL,
    campaign_id BIGINT NOT NULL,
    
    impressions BIGINT DEFAULT 0,
    reach BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    link_clicks BIGINT DEFAULT 0,
    
    spend DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Conversões da plataforma
    leads_platform INT DEFAULT 0,            -- Leads reportados pela plataforma
    
    -- Métricas calculadas
    cpm DECIMAL(12,4) NULL,
    cpc DECIMAL(12,4) NULL,
    ctr DECIMAL(8,4) NULL,
    cpl_platform DECIMAL(12,4) NULL,
    
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_date_campaign (date_key, campaign_id),
    INDEX idx_date (date_key),
    INDEX idx_campaign (campaign_id),
    
    FOREIGN KEY (date_key) REFERENCES dim_dates(date_key),
    FOREIGN KEY (campaign_id) REFERENCES dim_campaigns(campaign_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- fct_lead_attribution - Atribuição de leads a campanhas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS fct_lead_attribution (
    attribution_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lead_id BIGINT NOT NULL,
    campaign_id BIGINT NOT NULL,
    
    attribution_model VARCHAR(50) NOT NULL,  -- last_click, first_click
    attribution_weight DECIMAL(5,4) DEFAULT 1.0,
    
    -- Se lead converteu, atribuir valor
    attributed_value DECIMAL(14,2) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_lead_campaign_model (lead_id, campaign_id, attribution_model),
    INDEX idx_lead (lead_id),
    INDEX idx_campaign (campaign_id),
    
    FOREIGN KEY (lead_id) REFERENCES fct_leads(lead_id),
    FOREIGN KEY (campaign_id) REFERENCES dim_campaigns(campaign_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- fct_offline_conversions - Conversões para enviar às plataformas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS fct_offline_conversions (
    conversion_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lead_id BIGINT NOT NULL,
    
    -- Evento
    event_name VARCHAR(100) NOT NULL,        -- Lead, QualifiedLead, Purchase
    event_time DATETIME NOT NULL,
    event_value DECIMAL(14,2) NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Identificadores para match
    email_hash VARCHAR(64) NULL,             -- SHA256
    phone_hash VARCHAR(64) NULL,
    fbc VARCHAR(255) NULL,
    fbp VARCHAR(255) NULL,
    gclid VARCHAR(255) NULL,
    
    -- Status de envio
    meta_sent BOOLEAN DEFAULT FALSE,
    meta_sent_at DATETIME NULL,
    meta_event_id VARCHAR(100) NULL,
    
    google_sent BOOLEAN DEFAULT FALSE,
    google_sent_at DATETIME NULL,
    google_conversion_id VARCHAR(100) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_lead (lead_id),
    INDEX idx_event_time (event_time),
    INDEX idx_meta_sent (meta_sent),
    INDEX idx_google_sent (google_sent),
    
    FOREIGN KEY (lead_id) REFERENCES fct_leads(lead_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABELAS RAW
-- ============================================================

-- -----------------------------------------------------
-- raw_form_submissions - Submissões de formulário
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS raw_form_submissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source VARCHAR(50) NOT NULL,             -- webhook, api, manual
    raw_data JSON NOT NULL,
    
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_lead_id BIGINT NULL,
    
    INDEX idx_extracted (extracted_at),
    INDEX idx_processed (processed_at)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- raw_meta_ads - Dados brutos Meta
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS raw_meta_ads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date_start DATE NOT NULL,
    account_id VARCHAR(50) NOT NULL,
    campaign_id VARCHAR(50) NOT NULL,
    campaign_name VARCHAR(500) NULL,
    adset_id VARCHAR(50) NULL,
    adset_name VARCHAR(500) NULL,
    ad_id VARCHAR(50) NULL,
    ad_name VARCHAR(500) NULL,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    spend DECIMAL(12,4) DEFAULT 0,
    actions JSON NULL,
    
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_date (date_start),
    INDEX idx_campaign (campaign_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- raw_google_ads - Dados brutos Google
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS raw_google_ads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    campaign_id VARCHAR(50) NOT NULL,
    campaign_name VARCHAR(500) NULL,
    ad_group_id VARCHAR(50) NULL,
    ad_group_name VARCHAR(500) NULL,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    cost_micros BIGINT DEFAULT 0,
    conversions DECIMAL(12,4) DEFAULT 0,
    
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_date (date),
    INDEX idx_campaign (campaign_id)
) ENGINE=InnoDB;

-- ============================================================
-- VIEWS PARA REPORTS
-- ============================================================

-- -----------------------------------------------------
-- rpt_daily_leads - Leads diários
-- -----------------------------------------------------
CREATE OR REPLACE VIEW rpt_daily_leads AS
SELECT 
    d.full_date,
    d.day_of_week_name,
    
    -- Volume de leads
    COUNT(l.lead_id) as total_leads,
    COUNT(CASE WHEN l.lead_status = 'qualified' THEN 1 END) as qualified_leads,
    COUNT(CASE WHEN l.lead_status = 'converted' THEN 1 END) as converted_leads,
    
    -- Taxas
    COUNT(CASE WHEN l.lead_status = 'qualified' THEN 1 END) / NULLIF(COUNT(l.lead_id), 0) * 100 as qualification_rate,
    COUNT(CASE WHEN l.lead_status = 'converted' THEN 1 END) / NULLIF(COUNT(l.lead_id), 0) * 100 as conversion_rate,
    
    -- Ads
    COALESCE(SUM(s.spend), 0) as ad_spend,
    COALESCE(SUM(s.clicks), 0) as ad_clicks,
    
    -- CPL real
    CASE WHEN COUNT(l.lead_id) > 0 
        THEN SUM(s.spend) / COUNT(l.lead_id) 
        ELSE NULL 
    END as cpl_real,
    
    -- Valor gerado
    SUM(l.deal_value) as total_deal_value

FROM dim_dates d
LEFT JOIN fct_leads l ON d.date_key = l.date_key
LEFT JOIN fct_ad_spend s ON d.date_key = s.date_key
WHERE d.full_date >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)
GROUP BY d.date_key, d.full_date, d.day_of_week_name
ORDER BY d.full_date DESC;

-- -----------------------------------------------------
-- rpt_campaign_performance - Performance por campanha
-- -----------------------------------------------------
CREATE OR REPLACE VIEW rpt_campaign_performance AS
SELECT 
    c.platform,
    c.campaign_name,
    c.adset_name,
    c.funnel_stage,
    
    -- Métricas de ads (30 dias)
    SUM(s.impressions) as impressions,
    SUM(s.clicks) as clicks,
    SUM(s.spend) as spend,
    
    -- Leads atribuídos
    COUNT(DISTINCT la.lead_id) as attributed_leads,
    COUNT(DISTINCT CASE WHEN l.lead_status = 'qualified' THEN la.lead_id END) as qualified_leads,
    COUNT(DISTINCT CASE WHEN l.lead_status = 'converted' THEN la.lead_id END) as converted_leads,
    
    -- CPL
    CASE WHEN COUNT(DISTINCT la.lead_id) > 0 
        THEN SUM(s.spend) / COUNT(DISTINCT la.lead_id) 
        ELSE NULL 
    END as cpl,
    
    -- CPL Qualificado
    CASE WHEN COUNT(DISTINCT CASE WHEN l.lead_status = 'qualified' THEN la.lead_id END) > 0 
        THEN SUM(s.spend) / COUNT(DISTINCT CASE WHEN l.lead_status = 'qualified' THEN la.lead_id END) 
        ELSE NULL 
    END as cpql,
    
    -- ROI
    SUM(CASE WHEN l.lead_status = 'converted' THEN l.deal_value ELSE 0 END) as revenue,
    CASE WHEN SUM(s.spend) > 0 
        THEN SUM(CASE WHEN l.lead_status = 'converted' THEN l.deal_value ELSE 0 END) / SUM(s.spend) 
        ELSE NULL 
    END as roi

FROM dim_campaigns c
JOIN fct_ad_spend s ON c.campaign_id = s.campaign_id
JOIN dim_dates d ON s.date_key = d.date_key
LEFT JOIN fct_lead_attribution la ON c.campaign_id = la.campaign_id AND la.attribution_model = 'last_click'
LEFT JOIN fct_leads l ON la.lead_id = l.lead_id
WHERE d.full_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY c.campaign_id, c.platform, c.campaign_name, c.adset_name, c.funnel_stage
ORDER BY spend DESC;

-- -----------------------------------------------------
-- rpt_funnel_analysis - Análise de funil
-- -----------------------------------------------------
CREATE OR REPLACE VIEW rpt_funnel_analysis AS
SELECT 
    ls.source_name,
    ls.is_paid,
    
    -- Volume por etapa
    COUNT(l.lead_id) as total_leads,
    COUNT(CASE WHEN l.lead_status IN ('contacted', 'qualified', 'converted') THEN 1 END) as contacted,
    COUNT(CASE WHEN l.lead_status IN ('qualified', 'converted') THEN 1 END) as qualified,
    COUNT(CASE WHEN l.lead_status = 'converted' THEN 1 END) as converted,
    
    -- Taxas de conversão
    COUNT(CASE WHEN l.lead_status IN ('contacted', 'qualified', 'converted') THEN 1 END) / 
        NULLIF(COUNT(l.lead_id), 0) * 100 as contact_rate,
    COUNT(CASE WHEN l.lead_status IN ('qualified', 'converted') THEN 1 END) / 
        NULLIF(COUNT(CASE WHEN l.lead_status IN ('contacted', 'qualified', 'converted') THEN 1 END), 0) * 100 as qualification_rate,
    COUNT(CASE WHEN l.lead_status = 'converted' THEN 1 END) / 
        NULLIF(COUNT(CASE WHEN l.lead_status IN ('qualified', 'converted') THEN 1 END), 0) * 100 as close_rate,
    
    -- Taxa end-to-end
    COUNT(CASE WHEN l.lead_status = 'converted' THEN 1 END) / 
        NULLIF(COUNT(l.lead_id), 0) * 100 as overall_conversion_rate,
    
    -- Valor
    SUM(l.deal_value) as total_revenue,
    AVG(l.deal_value) as avg_deal_value,
    
    -- Tempo médio de conversão
    AVG(DATEDIFF(l.converted_at, l.created_at)) as avg_days_to_convert

FROM dim_lead_sources ls
LEFT JOIN fct_leads l ON ls.source_id = l.source_id
    AND l.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)
GROUP BY ls.source_id, ls.source_name, ls.is_paid
ORDER BY total_leads DESC;

-- -----------------------------------------------------
-- rpt_landing_page_performance - Performance por LP
-- -----------------------------------------------------
CREATE OR REPLACE VIEW rpt_landing_page_performance AS
SELECT 
    lp.page_name,
    lp.page_type,
    lp.offer_name,
    
    COUNT(l.lead_id) as total_leads,
    COUNT(CASE WHEN l.lead_status = 'qualified' THEN 1 END) as qualified_leads,
    COUNT(CASE WHEN l.lead_status = 'converted' THEN 1 END) as converted_leads,
    
    -- Taxa de qualificação por LP
    COUNT(CASE WHEN l.lead_status = 'qualified' THEN 1 END) / 
        NULLIF(COUNT(l.lead_id), 0) * 100 as qualification_rate,
    
    -- Score médio
    AVG(l.lead_score) as avg_lead_score,
    
    -- Valor gerado
    SUM(l.deal_value) as total_revenue

FROM dim_landing_pages lp
LEFT JOIN fct_leads l ON lp.landing_page_id = l.landing_page_id
    AND l.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY lp.landing_page_id, lp.page_name, lp.page_type, lp.offer_name
ORDER BY total_leads DESC;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- -----------------------------------------------------
-- sp_create_offline_conversion - Criar conversão offline
-- -----------------------------------------------------
DELIMITER //
CREATE PROCEDURE sp_create_offline_conversion(
    IN p_lead_id BIGINT,
    IN p_event_name VARCHAR(100),
    IN p_event_value DECIMAL(14,2)
)
BEGIN
    DECLARE v_email_hash VARCHAR(64);
    DECLARE v_phone_hash VARCHAR(64);
    DECLARE v_fbc VARCHAR(255);
    DECLARE v_fbp VARCHAR(255);
    DECLARE v_gclid VARCHAR(255);
    
    -- Buscar dados do lead
    SELECT email_hash, phone_hash, fbc, fbp, gclid
    INTO v_email_hash, v_phone_hash, v_fbc, v_fbp, v_gclid
    FROM fct_leads
    WHERE lead_id = p_lead_id;
    
    -- Inserir conversão
    INSERT INTO fct_offline_conversions (
        lead_id, event_name, event_time, event_value,
        email_hash, phone_hash, fbc, fbp, gclid
    ) VALUES (
        p_lead_id, p_event_name, NOW(), p_event_value,
        v_email_hash, v_phone_hash, v_fbc, v_fbp, v_gclid
    );
END //
DELIMITER ;

-- -----------------------------------------------------
-- sp_update_lead_status - Atualizar status do lead
-- -----------------------------------------------------
DELIMITER //
CREATE PROCEDURE sp_update_lead_status(
    IN p_lead_id BIGINT,
    IN p_new_status VARCHAR(50),
    IN p_deal_value DECIMAL(14,2)
)
BEGIN
    UPDATE fct_leads
    SET 
        lead_status = p_new_status,
        contacted_at = CASE WHEN p_new_status = 'contacted' AND contacted_at IS NULL THEN NOW() ELSE contacted_at END,
        qualified_at = CASE WHEN p_new_status = 'qualified' AND qualified_at IS NULL THEN NOW() ELSE qualified_at END,
        converted_at = CASE WHEN p_new_status = 'converted' AND converted_at IS NULL THEN NOW() ELSE converted_at END,
        deal_value = COALESCE(p_deal_value, deal_value),
        updated_at = NOW()
    WHERE lead_id = p_lead_id;
    
    -- Se converteu, criar conversão offline
    IF p_new_status = 'converted' THEN
        CALL sp_create_offline_conversion(p_lead_id, 'Purchase', p_deal_value);
    END IF;
END //
DELIMITER ;

-- Popular calendário
DELIMITER //
CREATE PROCEDURE sp_populate_dim_dates(IN start_date DATE, IN end_date DATE)
BEGIN
    DECLARE current_date_val DATE;
    SET current_date_val = start_date;
    
    WHILE current_date_val <= end_date DO
        INSERT IGNORE INTO dim_dates (
            date_key, full_date, day_of_week, day_of_week_name,
            day_of_month, day_of_year, week_of_year, month_number,
            month_name, quarter, year, is_weekend
        ) VALUES (
            DATE_FORMAT(current_date_val, '%Y%m%d'),
            current_date_val,
            DAYOFWEEK(current_date_val),
            DAYNAME(current_date_val),
            DAY(current_date_val),
            DAYOFYEAR(current_date_val),
            WEEK(current_date_val),
            MONTH(current_date_val),
            MONTHNAME(current_date_val),
            QUARTER(current_date_val),
            YEAR(current_date_val),
            DAYOFWEEK(current_date_val) IN (1, 7)
        );
        SET current_date_val = DATE_ADD(current_date_val, INTERVAL 1 DAY);
    END WHILE;
END //
DELIMITER ;

CALL sp_populate_dim_dates('2020-01-01', '2030-12-31');
