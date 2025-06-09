"""
Base Scraper Framework
Provides common functionality for all scrapers with rotation, proxy handling, and error management
"""

import requests
import time
import random
import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse
import json
from datetime import datetime, timedelta
import hashlib

@dataclass
class ScrapingResult:
    """Container for scraping results"""
    success: bool
    data: List[Dict[str, Any]]
    errors: List[str]
    source: str
    records_found: int
    execution_time: float
    metadata: Dict[str, Any]

class BaseScraper(ABC):
    """
    Base scraper class providing common functionality:
    - Proxy rotation
    - User agent rotation
    - Rate limiting
    - Session management
    - Error handling
    - Request retries
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = self._setup_logging()
        self.session = requests.Session()
        self.proxy_manager = ProxyManager(config.get('proxies', []))
        self.user_agents = self._load_user_agents()
        self.rate_limiter = RateLimiter(
            requests_per_minute=config.get('rate_limit', 30),
            delay_range=config.get('delay_range', (1, 3))
        )
        self.retry_config = config.get('retry_config', {
            'max_retries': 3,
            'backoff_factor': 2,
            'max_delay': 60
        })
        
    def _setup_logging(self) -> logging.Logger:
        """Setup logger for this scraper"""
        logger = logging.getLogger(f"scraper.{self.__class__.__name__}")
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def _load_user_agents(self) -> List[str]:
        """Load rotating user agents"""
        return [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        ]
    
    def _prepare_headers(self) -> Dict[str, str]:
        """Prepare headers with rotating user agent"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    
    def make_request(self, url: str, method: str = 'GET', **kwargs) -> Optional[requests.Response]:
        """
        Make HTTP request with retry logic and proxy rotation
        """
        headers = self._prepare_headers()
        headers.update(kwargs.pop('headers', {}))
        
        for attempt in range(self.retry_config['max_retries'] + 1):
            try:
                # Apply rate limiting
                self.rate_limiter.wait()
                
                # Setup proxy if available
                proxy = self.proxy_manager.get_proxy()
                proxies = {'http': proxy, 'https': proxy} if proxy else None
                
                # Make request
                response = self.session.request(
                    method=method,
                    url=url,
                    headers=headers,
                    proxies=proxies,
                    timeout=30,
                    **kwargs
                )
                
                # Check for success
                if response.status_code == 200:
                    self.logger.debug(f"Successfully fetched {url}")
                    return response
                elif response.status_code in [429, 503, 502, 504]:
                    # Rate limited or server error - retry with longer delay
                    self.logger.warning(f"Rate limited or server error {response.status_code} for {url}")
                    if attempt < self.retry_config['max_retries']:
                        delay = self.retry_config['backoff_factor'] ** attempt * random.uniform(5, 15)
                        time.sleep(min(delay, self.retry_config['max_delay']))
                        continue
                else:
                    self.logger.error(f"HTTP {response.status_code} for {url}")
                    return None
                    
            except requests.exceptions.RequestException as e:
                self.logger.error(f"Request failed for {url}: {str(e)}")
                if attempt < self.retry_config['max_retries']:
                    delay = self.retry_config['backoff_factor'] ** attempt
                    time.sleep(min(delay, self.retry_config['max_delay']))
                    continue
                
        self.logger.error(f"Failed to fetch {url} after {self.retry_config['max_retries']} attempts")
        return None
    
    @abstractmethod
    def scrape(self) -> ScrapingResult:
        """
        Main scraping method to be implemented by subclasses
        Returns ScrapingResult with data and metadata
        """
        pass
    
    @abstractmethod
    def parse_data(self, html_content: str, url: str) -> List[Dict[str, Any]]:
        """
        Parse HTML content and extract structured data
        """
        pass
    
    def validate_data(self, data: Dict[str, Any]) -> bool:
        """
        Validate extracted data before saving
        Override in subclasses for specific validation
        """
        required_fields = self.config.get('required_fields', [])
        for field in required_fields:
            if field not in data or not data[field]:
                return False
        return True
    
    def clean_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Clean and normalize data
        Override in subclasses for specific cleaning
        """
        # Basic cleaning - remove extra whitespace
        cleaned = {}
        for key, value in data.items():
            if isinstance(value, str):
                cleaned[key] = value.strip()
            else:
                cleaned[key] = value
        return cleaned
    
    def generate_hash(self, data: Dict[str, Any]) -> str:
        """Generate hash for duplicate detection"""
        # Create hash from key fields
        key_fields = self.config.get('hash_fields', ['url', 'title'])
        hash_string = ''.join(str(data.get(field, '')) for field in key_fields)
        return hashlib.md5(hash_string.encode()).hexdigest()


class ProxyManager:
    """Manages proxy rotation"""
    
    def __init__(self, proxies: List[str]):
        self.proxies = proxies
        self.current_index = 0
        self.failed_proxies = set()
    
    def get_proxy(self) -> Optional[str]:
        """Get next available proxy"""
        if not self.proxies:
            return None
            
        available_proxies = [p for p in self.proxies if p not in self.failed_proxies]
        if not available_proxies:
            # Reset failed proxies if all have failed
            self.failed_proxies.clear()
            available_proxies = self.proxies
        
        if available_proxies:
            proxy = available_proxies[self.current_index % len(available_proxies)]
            self.current_index += 1
            return proxy
        
        return None
    
    def mark_failed(self, proxy: str):
        """Mark proxy as failed"""
        self.failed_proxies.add(proxy)


class RateLimiter:
    """Implements rate limiting with randomized delays"""
    
    def __init__(self, requests_per_minute: int, delay_range: tuple):
        self.requests_per_minute = requests_per_minute
        self.delay_range = delay_range
        self.last_request_time = 0
        self.request_count = 0
        self.window_start = time.time()
    
    def wait(self):
        """Wait if necessary to respect rate limits"""
        current_time = time.time()
        
        # Reset window if needed
        if current_time - self.window_start >= 60:
            self.window_start = current_time
            self.request_count = 0
        
        # Check if we need to wait for rate limit
        if self.request_count >= self.requests_per_minute:
            wait_time = 60 - (current_time - self.window_start)
            if wait_time > 0:
                time.sleep(wait_time)
                self.window_start = time.time()
                self.request_count = 0
        
        # Add randomized delay between requests
        delay = random.uniform(*self.delay_range)
        time.sleep(delay)
        
        self.request_count += 1
        self.last_request_time = time.time()


class DataValidator:
    """Validates scraped data quality"""
    
    @staticmethod
    def validate_vin(vin: str) -> bool:
        """Validate VIN format"""
        if not vin or len(vin) != 17:
            return False
        # Basic VIN validation - no I, O, Q characters
        invalid_chars = {'I', 'O', 'Q'}
        return not any(char in invalid_chars for char in vin.upper())
    
    @staticmethod
    def validate_price(price: str) -> bool:
        """Validate price format"""
        if not price:
            return False
        # Remove common price formatting
        clean_price = price.replace('$', '').replace(',', '').replace(' ', '')
        try:
            float(clean_price)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def validate_year(year: str) -> bool:
        """Validate vehicle year"""
        try:
            year_int = int(year)
            current_year = datetime.now().year
            return 1900 <= year_int <= current_year + 2
        except ValueError:
            return False