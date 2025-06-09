# ImportIQ Targeted Web Scraping System

## Core Mission
Answer your customers' 3 essential questions:
1. **"Can I import this car?"** - Real government import eligibility data
2. **"How much will it cost?"** - Complete cost breakdowns with authentic duty rates
3. **"What do I need to do?"** - Step-by-step import process with exact timelines

## System Architecture

### Modular Design
```
/scrapers/
├── base_scraper.py              # Common functionality (proxy, rate limiting, retries)
├── vehicles_import_eligibility.py # NHTSA, EPA, DOT, international regulatory sources
├── customs_duty_rates.py        # Official customs duty rates and import costs
├── government_auctions.py       # GSA, police, municipal vehicle auctions
└── insurance_auctions.py        # Copart, IAA public listings

/data_pipeline/
├── validator.py                 # Data quality scoring and validation
├── transformer.py               # Data normalization and enrichment
└── loader.py                    # PostgreSQL integration with staging tables

/config/
├── scraper_config.yaml          # Complete configuration system
└── database_config.py           # PostgreSQL connection settings

/utils/
├── proxy_manager.py             # Proxy rotation and management
├── logging_setup.py             # Production logging configuration
└── scheduler.py                 # Daily automated runs with priority scheduling
```

## Target Vehicle Focus

### Popular Import Vehicles (Priority Data Collection)
- **JDM Performance**: Nissan Skyline GT-R (R32/R33/R34), Toyota Supra (A70/A80), Honda Civic Type R variants
- **European Performance**: BMW M3 (E30/E36/E46), Mercedes AMG series, Audi RS models
- **25-Year Eligibility**: Classic cars approaching US import eligibility
- **Specialty Vehicles**: Kei cars, commercial vehicles, unique imports

## Production Features

### Automated Daily Workflows
- **Import Eligibility**: Daily at 2:00 AM (highest priority)
- **Customs Duty Rates**: Weekly Sunday at 3:00 AM
- **Government Auctions**: Monday/Wednesday/Friday at 5:00 AM
- **Insurance Auctions**: Tuesday/Thursday/Saturday at 6:00 AM

### Data Quality System
- **Validation Pipeline**: VIN validation, price normalization, date standardization
- **Quality Scoring**: 0-1 scale with letter grades (A-F)
- **Duplicate Detection**: Hash-based deduplication across sources
- **Source Verification**: Track data provenance and regulatory authority

### Error Handling & Monitoring
- **Retry Logic**: Exponential backoff with max 3 attempts
- **Rate Limiting**: Configurable requests per minute (default: 30)
- **Health Monitoring**: Database, scraper, and disk space checks
- **Alerting**: Consecutive failure detection and logging

## Quick Start

### 1. Install Dependencies
```bash
pip install requests beautifulsoup4 pyyaml schedule psycopg2-binary
```

### 2. Configure System
Edit `config/scraper_config.yaml`:
```yaml
global:
  rate_limit: 30  # requests per minute
  delay_range: [2, 5]  # seconds between requests

import_eligibility:
  enabled: true
  schedule: "0 2 * * *"  # Daily at 2 AM
```

### 3. Setup PostgreSQL Extensions
```sql
-- Add staging tables for raw scraped data
CREATE TABLE scraped_data_staging (
    id SERIAL PRIMARY KEY,
    source TEXT,
    data_type TEXT,
    raw_data JSONB,
    quality_score FLOAT,
    processed BOOLEAN DEFAULT FALSE,
    scraped_at TIMESTAMP DEFAULT NOW()
);

-- Add scraping activity log
CREATE TABLE scraping_log (
    id SERIAL PRIMARY KEY,
    source TEXT,
    status TEXT,
    records_found INTEGER,
    errors TEXT[],
    execution_time INTERVAL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Add import eligibility tracking
CREATE TABLE import_eligibility_data (
    id SERIAL PRIMARY KEY,
    make TEXT,
    model TEXT,
    year INTEGER,
    country_destination TEXT,
    eligibility_status TEXT,
    regulatory_authority TEXT,
    twenty_five_year_rule BOOLEAN,
    requirements TEXT,
    source_url TEXT,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Add customs duty rates
CREATE TABLE customs_duty_rates (
    id SERIAL PRIMARY KEY,
    country TEXT,
    hts_code TEXT,
    tariff_code TEXT,
    description TEXT,
    duty_rate_percent FLOAT,
    vehicle_category TEXT,
    additional_fees TEXT,
    effective_date DATE,
    source TEXT,
    last_updated TIMESTAMP DEFAULT NOW()
);
```

### 4. Start Production Scheduler
```bash
python utils/scheduler.py
```

## Configuration Examples

### Target Specific Vehicles
```yaml
target_vehicles:
  jdm_popular:
    - {make: "Nissan", model: "Skyline GT-R", variants: ["R32", "R33", "R34"]}
    - {make: "Toyota", model: "Supra", variants: ["A70", "A80", "A90"]}
    - {make: "Honda", model: "Civic Type R", variants: ["EK9", "EP3", "FD2"]}
```

### Duty Rate Sources
```yaml
customs_duty_rates:
  sources:
    us_customs:
      base_url: "https://hts.usitc.gov"
      vehicle_codes: ["8703", "8704", "8705"]  # HTS codes for vehicles
    canada_cbsa:
      base_url: "https://www.cbsa-asfc.gc.ca"
    uk_hmrc:
      base_url: "https://www.gov.uk/trade-tariff"
```

## Data Validation Rules

### Vehicle Data Validation
- **VIN Format**: 17-character alphanumeric (no I, O, Q)
- **Year Range**: 1900 to current year + 2
- **Make Validation**: Against known manufacturer list
- **Price Validation**: Positive numbers, reasonable ranges

### Import Eligibility Validation
- **Country Mapping**: Standardized country names
- **Authority Verification**: Known regulatory bodies (NHTSA, EPA, DOT, etc.)
- **Status Validation**: Eligible/Not Eligible/Conditional/Requires Assessment

### Duty Rate Validation
- **HTS Code Format**: 4-10 digits with optional decimals (8703.23.00)
- **Rate Ranges**: 0-100% with warnings for unusual rates
- **Date Validation**: Effective dates in multiple formats

## Production Scaling Strategy

### Month 1: 523 → 1,500 Records
- **Week 1-2**: Import eligibility for top 50 popular vehicles
- **Week 3-4**: Customs duty rates for all major markets

### Month 2: 1,500 → 3,000 Records
- **Government auctions**: GSA, police departments
- **Insurance auctions**: Copart public listings

### Month 3: 3,000 → 5,000+ Records
- **International expansion**: UK, EU, Australia regulatory data
- **Timeline data**: Real import process durations

## Monitoring & Maintenance

### Daily Health Checks
```bash
# Check scheduler status
python -c "
from utils.scheduler import ImportIQScheduler
scheduler = ImportIQScheduler()
print(scheduler.get_status())
"

# Validate recent data quality
python -c "
from data_pipeline.validator import DataValidator
validator = DataValidator()
# Check last 100 records
"
```

### Weekly Reports
- Scraping success rates by source
- Data quality scores and trending
- New vehicle eligibility discoveries
- Duty rate changes detected

## Error Recovery

### Common Issues & Solutions

**Rate Limiting (429 errors)**
- Automatic backoff with exponential delay
- User agent rotation
- Proxy failover if configured

**Data Validation Failures**
- Records logged to staging table
- Manual review queue for edge cases
- Quality score degradation alerts

**Source Changes**
- Parser error detection
- Automatic fallback to backup sources
- Alert system for manual intervention

## Integration with ImportIQ

### API Endpoints for Web App
```javascript
// Get import eligibility for specific vehicle
GET /api/import-eligibility?make=Nissan&model=Skyline&year=1999&country=US

// Get complete cost breakdown
GET /api/import-costs?make=Toyota&model=Supra&year=1993&destination=Australia

// Get import timeline
GET /api/import-timeline?vehicle_type=passenger_car&destination=Canada
```

### Dashboard Integration
- Real-time scraping status
- Data quality metrics
- Source health monitoring
- Record growth tracking

## Compliance & Best Practices

### Ethical Scraping
- Respect robots.txt files
- Implement rate limiting (30 req/min default)
- Use public/government sources only
- No authentication bypass

### Data Accuracy
- Source verification required
- Government data prioritized
- Cross-reference multiple sources
- Date stamps on all data

### Performance Optimization
- Concurrent scraping with limits
- Database connection pooling
- Staged data loading
- Incremental updates only

## Support & Troubleshooting

### Log Files
- `/logs/scheduler.log` - Main scheduler activity
- `/logs/scraper_errors.log` - Scraping failures
- `/logs/data_quality.log` - Validation issues

### Manual Operations
```bash
# Run specific scraper manually
python -c "
from utils.scheduler import ImportIQScheduler
scheduler = ImportIQScheduler()
scheduler.run_manual_job('import_eligibility')
"

# Check data quality for recent imports
python -c "
from data_pipeline.validator import DataValidator
validator = DataValidator()
# Manual validation commands
"
```

This system is designed to scale your 523 existing records to 5,000+ within a month while maintaining the highest data quality standards and focusing exclusively on answering your customers' three core questions about vehicle imports.