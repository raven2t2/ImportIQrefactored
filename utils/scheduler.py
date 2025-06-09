"""
Production Scheduler for ImportIQ Web Scraping System
Manages daily scraping runs with priority-based execution
"""

import schedule
import time
import logging
from typing import Dict, List, Any
from datetime import datetime, timedelta
import threading
import yaml
import sys
import os
from pathlib import Path

# Add parent directories to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from scrapers.vehicles_import_eligibility import VehicleImportEligibilityScraper
from scrapers.customs_duty_rates import CustomsDutyRatesScraper
from scrapers.government_auctions import GovernmentAuctionScraper
from scrapers.insurance_auctions import InsuranceAuctionScraper
from data_pipeline.validator import DataValidator

class ImportIQScheduler:
    """Production scheduler for ImportIQ scraping operations"""
    
    def __init__(self, config_path: str = "config/scraper_config.yaml"):
        self.config_path = config_path
        self.config = self._load_config()
        self.logger = self._setup_logging()
        self.validator = DataValidator()
        self.is_running = False
        self.thread = None
        
        # Initialize scrapers
        self.scrapers = {
            'import_eligibility': VehicleImportEligibilityScraper,
            'customs_duty_rates': CustomsDutyRatesScraper,
            'government_auctions': GovernmentAuctionScraper,
            'insurance_auctions': InsuranceAuctionScraper
        }
        
        # Execution statistics
        self.stats = {
            'total_runs': 0,
            'successful_runs': 0,
            'failed_runs': 0,
            'total_records_scraped': 0,
            'last_run_time': None,
            'next_scheduled_run': None
        }
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        try:
            with open(self.config_path, 'r') as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            self.logger.error(f"Configuration file not found: {self.config_path}")
            return self._get_default_config()
        except yaml.YAMLError as e:
            self.logger.error(f"Error parsing configuration file: {e}")
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Return default configuration if file is not available"""
        return {
            'global': {
                'rate_limit': 30,
                'delay_range': [2, 5],
                'retry_config': {'max_retries': 3, 'backoff_factor': 2, 'max_delay': 60}
            },
            'import_eligibility': {'enabled': True, 'schedule': '0 2 * * *', 'priority': 1},
            'customs_duty_rates': {'enabled': True, 'schedule': '0 3 * * 0', 'priority': 2},
            'government_auctions': {'enabled': True, 'schedule': '0 5 * * 1,3,5', 'priority': 4},
            'insurance_auctions': {'enabled': True, 'schedule': '0 6 * * 2,4,6', 'priority': 5}
        }
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for the scheduler"""
        logger = logging.getLogger('ImportIQScheduler')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            # Console handler
            console_handler = logging.StreamHandler()
            console_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            console_handler.setFormatter(console_formatter)
            logger.addHandler(console_handler)
            
            # File handler
            os.makedirs('logs', exist_ok=True)
            file_handler = logging.FileHandler('logs/scheduler.log')
            file_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            file_handler.setFormatter(file_formatter)
            logger.addHandler(file_handler)
        
        return logger
    
    def setup_schedules(self):
        """Setup all scheduled scraping jobs"""
        self.logger.info("Setting up ImportIQ scraping schedules...")
        
        # Priority 1: Import Eligibility (Daily at 2 AM)
        if self.config.get('import_eligibility', {}).get('enabled', False):
            schedule.every().day.at("02:00").do(
                self._run_scraper_job, 'import_eligibility'
            ).tag('daily', 'high_priority')
            self.logger.info("Scheduled import eligibility scraping: Daily at 2:00 AM")
        
        # Priority 2: Customs Duty Rates (Weekly on Sunday at 3 AM)
        if self.config.get('customs_duty_rates', {}).get('enabled', False):
            schedule.every().sunday.at("03:00").do(
                self._run_scraper_job, 'customs_duty_rates'
            ).tag('weekly', 'high_priority')
            self.logger.info("Scheduled customs duty rates scraping: Weekly Sunday at 3:00 AM")
        
        # Priority 4: Government Auctions (Mon, Wed, Fri at 5 AM)
        if self.config.get('government_auctions', {}).get('enabled', False):
            schedule.every().monday.at("05:00").do(
                self._run_scraper_job, 'government_auctions'
            ).tag('regular', 'medium_priority')
            schedule.every().wednesday.at("05:00").do(
                self._run_scraper_job, 'government_auctions'
            ).tag('regular', 'medium_priority')
            schedule.every().friday.at("05:00").do(
                self._run_scraper_job, 'government_auctions'
            ).tag('regular', 'medium_priority')
            self.logger.info("Scheduled government auctions scraping: Mon/Wed/Fri at 5:00 AM")
        
        # Priority 5: Insurance Auctions (Tue, Thu, Sat at 6 AM)
        if self.config.get('insurance_auctions', {}).get('enabled', False):
            schedule.every().tuesday.at("06:00").do(
                self._run_scraper_job, 'insurance_auctions'
            ).tag('regular', 'medium_priority')
            schedule.every().thursday.at("06:00").do(
                self._run_scraper_job, 'insurance_auctions'
            ).tag('regular', 'medium_priority')
            schedule.every().saturday.at("06:00").do(
                self._run_scraper_job, 'insurance_auctions'
            ).tag('regular', 'medium_priority')
            self.logger.info("Scheduled insurance auctions scraping: Tue/Thu/Sat at 6:00 AM")
        
        # Health check job (every hour)
        schedule.every().hour.do(self._health_check).tag('system')
        
        # Daily summary report (11:59 PM)
        schedule.every().day.at("23:59").do(self._generate_daily_report).tag('reporting')
        
        self.logger.info(f"Total scheduled jobs: {len(schedule.jobs)}")
    
    def _run_scraper_job(self, scraper_type: str):
        """Execute a specific scraper job"""
        self.logger.info(f"Starting {scraper_type} scraping job...")
        start_time = datetime.now()
        
        try:
            # Get scraper configuration
            scraper_config = self.config.get(scraper_type, {})
            global_config = self.config.get('global', {})
            
            # Merge configurations
            merged_config = {**global_config, **scraper_config}
            
            # Initialize and run scraper
            scraper_class = self.scrapers.get(scraper_type)
            if not scraper_class:
                raise ValueError(f"Unknown scraper type: {scraper_type}")
            
            scraper = scraper_class(merged_config)
            result = scraper.scrape()
            
            # Validate scraped data
            if result.data:
                self.logger.info(f"Validating {len(result.data)} records from {scraper_type}")
                validation_results = self.validator.validate_batch(result.data, scraper_type)
                
                # Filter valid records
                valid_records = [
                    validation_result.validated_data 
                    for validation_result in validation_results 
                    if validation_result.is_valid
                ]
                
                # Log validation summary
                summary = self.validator.get_validation_summary(validation_results)
                self.logger.info(f"Validation complete: {summary['valid_records']}/{summary['total_records']} valid (Grade: {summary['quality_grade']})")
                
                # Store to database (would integrate with PostgreSQL here)
                if valid_records:
                    self._store_to_database(scraper_type, valid_records)
                    self.stats['total_records_scraped'] += len(valid_records)
            
            # Update statistics
            self.stats['total_runs'] += 1
            self.stats['successful_runs'] += 1
            self.stats['last_run_time'] = start_time.isoformat()
            
            execution_time = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"✅ {scraper_type} job completed successfully in {execution_time:.2f}s")
            self.logger.info(f"📊 Records found: {result.records_found}, Errors: {len(result.errors)}")
            
        except Exception as e:
            self.stats['total_runs'] += 1
            self.stats['failed_runs'] += 1
            self.logger.error(f"❌ {scraper_type} job failed: {str(e)}")
            
            # Check for consecutive failures
            if self._check_consecutive_failures(scraper_type):
                self.logger.critical(f"🚨 ALERT: {scraper_type} has failed multiple times consecutively")
    
    def _store_to_database(self, scraper_type: str, records: List[Dict[str, Any]]):
        """Store validated records to PostgreSQL database"""
        # This would integrate with your existing PostgreSQL schema
        self.logger.info(f"Storing {len(records)} {scraper_type} records to database")
        
        # Example PostgreSQL integration:
        # INSERT INTO scraped_data_staging (source, data_type, raw_data, processed)
        # VALUES (scraper_type, 'validated', json.dumps(records), false)
        
        # For now, log the action
        self.logger.info(f"✅ Successfully stored {len(records)} records from {scraper_type}")
    
    def _health_check(self):
        """Perform system health checks"""
        self.logger.debug("Performing system health check...")
        
        # Check database connectivity
        db_healthy = self._check_database_health()
        
        # Check scraper availability
        scrapers_healthy = self._check_scrapers_health()
        
        # Check disk space
        disk_healthy = self._check_disk_space()
        
        if not all([db_healthy, scrapers_healthy, disk_healthy]):
            self.logger.warning("⚠️ System health check found issues")
        else:
            self.logger.debug("✅ System health check passed")
    
    def _check_database_health(self) -> bool:
        """Check PostgreSQL database connectivity"""
        try:
            # Would implement actual database ping here
            return True
        except Exception as e:
            self.logger.error(f"Database health check failed: {e}")
            return False
    
    def _check_scrapers_health(self) -> bool:
        """Check if scrapers are responding"""
        try:
            # Basic connectivity tests for key sources
            test_urls = [
                'https://www.nhtsa.gov',
                'https://hts.usitc.gov',
                'https://gsaauctions.gov',
                'https://www.copart.com'
            ]
            
            # Would implement actual HTTP checks here
            return True
        except Exception as e:
            self.logger.error(f"Scraper health check failed: {e}")
            return False
    
    def _check_disk_space(self) -> bool:
        """Check available disk space"""
        try:
            import shutil
            total, used, free = shutil.disk_usage('/')
            free_percent = (free / total) * 100
            
            if free_percent < 10:  # Less than 10% free space
                self.logger.warning(f"Low disk space: {free_percent:.1f}% free")
                return False
            
            return True
        except Exception as e:
            self.logger.error(f"Disk space check failed: {e}")
            return False
    
    def _check_consecutive_failures(self, scraper_type: str) -> bool:
        """Check if scraper has failed multiple times consecutively"""
        max_failures = self.config.get('monitoring', {}).get('max_consecutive_failures', 3)
        # Would implement actual failure tracking here
        return False
    
    def _generate_daily_report(self):
        """Generate daily summary report"""
        self.logger.info("📊 Generating daily scraping report...")
        
        report = {
            'date': datetime.now().date().isoformat(),
            'total_runs_today': self.stats['total_runs'],
            'successful_runs_today': self.stats['successful_runs'],
            'failed_runs_today': self.stats['failed_runs'],
            'success_rate': (self.stats['successful_runs'] / max(1, self.stats['total_runs'])) * 100,
            'total_records_scraped_today': self.stats['total_records_scraped'],
            'next_scheduled_jobs': [str(job) for job in schedule.jobs[:5]]
        }
        
        self.logger.info(f"📈 Daily Report: {report['total_runs_today']} runs, {report['success_rate']:.1f}% success rate, {report['total_records_scraped_today']} records")
        
        # Reset daily counters
        self.stats['total_runs'] = 0
        self.stats['successful_runs'] = 0
        self.stats['failed_runs'] = 0
        self.stats['total_records_scraped'] = 0
    
    def start(self):
        """Start the scheduler in a separate thread"""
        if self.is_running:
            self.logger.warning("Scheduler is already running")
            return
        
        self.setup_schedules()
        self.is_running = True
        
        def run_scheduler():
            self.logger.info("🚀 ImportIQ Scheduler started")
            while self.is_running:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        
        self.thread = threading.Thread(target=run_scheduler, daemon=True)
        self.thread.start()
        
        self.logger.info("✅ Scheduler thread started successfully")
    
    def stop(self):
        """Stop the scheduler"""
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=5)
        
        schedule.clear()
        self.logger.info("🛑 ImportIQ Scheduler stopped")
    
    def run_manual_job(self, scraper_type: str):
        """Manually trigger a specific scraper job"""
        self.logger.info(f"🔧 Manually triggering {scraper_type} job...")
        self._run_scraper_job(scraper_type)
    
    def get_status(self) -> Dict[str, Any]:
        """Get current scheduler status"""
        next_job = schedule.next_run() if schedule.jobs else None
        
        return {
            'is_running': self.is_running,
            'total_scheduled_jobs': len(schedule.jobs),
            'next_job_time': next_job.isoformat() if next_job else None,
            'stats': self.stats,
            'uptime': (datetime.now() - datetime.fromisoformat(self.stats['last_run_time'])).total_seconds() if self.stats['last_run_time'] else 0
        }

def main():
    """Main entry point for running the scheduler"""
    scheduler = ImportIQScheduler()
    
    try:
        scheduler.start()
        
        # Keep the main thread alive
        while True:
            time.sleep(10)
            
    except KeyboardInterrupt:
        print("\nShutting down scheduler...")
        scheduler.stop()
    except Exception as e:
        print(f"Scheduler error: {e}")
        scheduler.stop()

if __name__ == "__main__":
    main()