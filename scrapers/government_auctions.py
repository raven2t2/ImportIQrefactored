"""
Government Auction Scraper
Scrapes public vehicle auctions from GSA, police departments, and municipal sources
"""

import re
from bs4 import BeautifulSoup
from typing import Dict, List, Any
from .base_scraper import BaseScraper, ScrapingResult
import time
from datetime import datetime

class GovernmentAuctionScraper(BaseScraper):
    """Scraper for government vehicle auctions"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.auction_sources = config.get('auction_sources', {
            'gsa': {
                'base_url': 'https://gsaauctions.gov',
                'search_path': '/auctions/vehicleSearch',
                'params': {'vehicleCategory': 'vehicles'}
            },
            'govdeals': {
                'base_url': 'https://www.govdeals.com',
                'search_path': '/index.cfm',
                'params': {'fa': 'Main.AdvSearchResultsNew', 'kWord': 'vehicle'}
            }
        })
    
    def scrape(self) -> ScrapingResult:
        """Main scraping method for government auctions"""
        start_time = time.time()
        all_data = []
        errors = []
        
        for source_name, source_config in self.auction_sources.items():
            try:
                self.logger.info(f"Scraping {source_name} auctions...")
                data = self._scrape_source(source_name, source_config)
                all_data.extend(data)
                self.logger.info(f"Found {len(data)} vehicles from {source_name}")
            except Exception as e:
                error_msg = f"Error scraping {source_name}: {str(e)}"
                self.logger.error(error_msg)
                errors.append(error_msg)
        
        execution_time = time.time() - start_time
        
        return ScrapingResult(
            success=len(errors) == 0,
            data=all_data,
            errors=errors,
            source="government_auctions",
            records_found=len(all_data),
            execution_time=execution_time,
            metadata={
                'sources_scraped': list(self.auction_sources.keys()),
                'timestamp': datetime.now().isoformat()
            }
        )
    
    def _scrape_source(self, source_name: str, source_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scrape a specific government auction source"""
        base_url = source_config['base_url']
        search_path = source_config['search_path']
        params = source_config.get('params', {})
        
        # Build search URL
        search_url = f"{base_url}{search_path}"
        
        # Make request
        response = self.make_request(search_url, params=params)
        if not response:
            return []
        
        # Parse response
        return self.parse_data(response.text, search_url)
    
    def parse_data(self, html_content: str, url: str) -> List[Dict[str, Any]]:
        """Parse HTML content to extract vehicle auction data"""
        soup = BeautifulSoup(html_content, 'html.parser')
        vehicles = []
        
        # GSA Auctions parsing
        if 'gsaauctions.gov' in url:
            vehicles.extend(self._parse_gsa_auctions(soup, url))
        
        # GovDeals parsing
        elif 'govdeals.com' in url:
            vehicles.extend(self._parse_govdeals_auctions(soup, url))
        
        # Generic government auction parsing
        else:
            vehicles.extend(self._parse_generic_government_auction(soup, url))
        
        return vehicles
    
    def _parse_gsa_auctions(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Parse GSA auction listings"""
        vehicles = []
        
        # Look for auction item containers
        auction_items = soup.find_all(['div', 'tr'], class_=re.compile(r'auction|item|listing'))
        
        for item in auction_items:
            try:
                # Extract vehicle data
                title_elem = item.find(['h3', 'h4', 'a'], string=re.compile(r'(?i)(vehicle|car|truck|suv)', re.I))
                if not title_elem:
                    continue
                
                title = title_elem.get_text(strip=True)
                
                # Extract year, make, model from title
                year_match = re.search(r'\b(19|20)\d{2}\b', title)
                year = int(year_match.group()) if year_match else None
                
                make_match = re.search(r'\b(Toyota|Honda|Nissan|Ford|Chevrolet|BMW|Mercedes|Audi|Volkswagen|Subaru|Mazda|Hyundai|Kia|Lexus|Acura|Infiniti)\b', title, re.I)
                make = make_match.group() if make_match else self._extract_make_from_title(title)
                
                # Extract price
                price_elem = item.find(['span', 'div'], string=re.compile(r'\$[\d,]+'))
                price = self._extract_price(price_elem.get_text() if price_elem else '')
                
                # Extract auction details
                auction_date_elem = item.find(['span', 'div'], string=re.compile(r'ends|closes|auction', re.I))
                auction_date = self._extract_date(auction_date_elem.get_text() if auction_date_elem else '')
                
                # Extract VIN if available
                vin_elem = item.find(['span', 'div'], string=re.compile(r'VIN|Vehicle ID', re.I))
                vin = self._extract_vin(vin_elem.get_text() if vin_elem else '')
                
                # Extract mileage
                mileage_elem = item.find(['span', 'div'], string=re.compile(r'miles|mileage|odometer', re.I))
                mileage = self._extract_mileage(mileage_elem.get_text() if mileage_elem else '')
                
                vehicle_data = {
                    'title': title,
                    'make': make,
                    'model': self._extract_model_from_title(title, make),
                    'year': year,
                    'price': price,
                    'vin': vin,
                    'mileage': mileage,
                    'auction_date': auction_date,
                    'source': 'GSA Auctions',
                    'url': url,
                    'condition': 'Government Fleet',
                    'auction_type': 'Government Auction',
                    'scraped_at': datetime.now().isoformat()
                }
                
                if self.validate_data(vehicle_data):
                    vehicles.append(self.clean_data(vehicle_data))
                
            except Exception as e:
                self.logger.warning(f"Error parsing GSA auction item: {str(e)}")
                continue
        
        return vehicles
    
    def _parse_govdeals_auctions(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Parse GovDeals auction listings"""
        vehicles = []
        
        # Look for auction listings
        listings = soup.find_all(['div', 'tr'], class_=re.compile(r'listing|item|auction'))
        
        for listing in listings:
            try:
                # Extract title
                title_elem = listing.find(['a', 'h3', 'h4'])
                if not title_elem:
                    continue
                
                title = title_elem.get_text(strip=True)
                
                # Skip non-vehicle items
                if not re.search(r'(?i)(vehicle|car|truck|suv|sedan|coupe|van|motorcycle)', title):
                    continue
                
                # Extract vehicle details
                year_match = re.search(r'\b(19|20)\d{2}\b', title)
                year = int(year_match.group()) if year_match else None
                
                make = self._extract_make_from_title(title)
                model = self._extract_model_from_title(title, make)
                
                # Extract price
                price_elem = listing.find(['span', 'div'], class_=re.compile(r'price|bid|amount'))
                price = self._extract_price(price_elem.get_text() if price_elem else '')
                
                # Extract auction end date
                date_elem = listing.find(['span', 'div'], string=re.compile(r'ends|closes', re.I))
                auction_date = self._extract_date(date_elem.get_text() if date_elem else '')
                
                vehicle_data = {
                    'title': title,
                    'make': make,
                    'model': model,
                    'year': year,
                    'price': price,
                    'auction_date': auction_date,
                    'source': 'GovDeals',
                    'url': url,
                    'condition': 'Government Surplus',
                    'auction_type': 'Government Auction',
                    'scraped_at': datetime.now().isoformat()
                }
                
                if self.validate_data(vehicle_data):
                    vehicles.append(self.clean_data(vehicle_data))
                
            except Exception as e:
                self.logger.warning(f"Error parsing GovDeals item: {str(e)}")
                continue
        
        return vehicles
    
    def _parse_generic_government_auction(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Generic parser for government auction sites"""
        vehicles = []
        
        # Look for common auction item patterns
        items = soup.find_all(['div', 'tr', 'li'], string=re.compile(r'(?i)(vehicle|car|truck|auto)', re.I))
        
        for item in items[:20]:  # Limit to first 20 matches
            try:
                text = item.get_text(strip=True)
                
                # Extract basic vehicle info from text
                year_match = re.search(r'\b(19|20)\d{2}\b', text)
                year = int(year_match.group()) if year_match else None
                
                make = self._extract_make_from_title(text)
                if not make:
                    continue
                
                model = self._extract_model_from_title(text, make)
                price = self._extract_price(text)
                
                vehicle_data = {
                    'title': text[:100],  # First 100 chars
                    'make': make,
                    'model': model,
                    'year': year,
                    'price': price,
                    'source': 'Government Auction',
                    'url': url,
                    'condition': 'Government Fleet',
                    'auction_type': 'Government Auction',
                    'scraped_at': datetime.now().isoformat()
                }
                
                if self.validate_data(vehicle_data):
                    vehicles.append(self.clean_data(vehicle_data))
                
            except Exception as e:
                self.logger.warning(f"Error parsing generic auction item: {str(e)}")
                continue
        
        return vehicles
    
    def _extract_make_from_title(self, title: str) -> str:
        """Extract vehicle make from title"""
        makes = ['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 
                'Volkswagen', 'Subaru', 'Mazda', 'Hyundai', 'Kia', 'Lexus', 'Acura', 'Infiniti',
                'Jeep', 'Ram', 'Dodge', 'Chrysler', 'Buick', 'Cadillac', 'GMC', 'Lincoln',
                'Volvo', 'Porsche', 'Jaguar', 'Land Rover', 'Mini', 'Tesla', 'Mitsubishi']
        
        for make in makes:
            if re.search(rf'\b{make}\b', title, re.I):
                return make
        
        return 'Unknown'
    
    def _extract_model_from_title(self, title: str, make: str) -> str:
        """Extract vehicle model from title"""
        # Remove make from title and extract likely model
        title_without_make = re.sub(rf'\b{make}\b', '', title, flags=re.I).strip()
        
        # Look for common model patterns
        model_match = re.search(r'\b([A-Z][a-z]*\s*[A-Z0-9]*)\b', title_without_make)
        if model_match:
            return model_match.group(1).strip()
        
        return 'Unknown'
    
    def _extract_price(self, text: str) -> float:
        """Extract price from text"""
        price_match = re.search(r'\$?([\d,]+(?:\.\d{2})?)', text.replace(',', ''))
        if price_match:
            try:
                return float(price_match.group(1).replace(',', ''))
            except ValueError:
                pass
        return 0.0
    
    def _extract_date(self, text: str) -> str:
        """Extract date from text"""
        # Look for various date formats
        date_patterns = [
            r'\d{1,2}/\d{1,2}/\d{4}',
            r'\d{4}-\d{2}-\d{2}',
            r'\w+ \d{1,2}, \d{4}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group()
        
        return ''
    
    def _extract_vin(self, text: str) -> str:
        """Extract VIN from text"""
        vin_match = re.search(r'\b[A-HJ-NPR-Z0-9]{17}\b', text)
        return vin_match.group() if vin_match else ''
    
    def _extract_mileage(self, text: str) -> int:
        """Extract mileage from text"""
        mileage_match = re.search(r'([\d,]+)\s*(?:miles|mi)', text, re.I)
        if mileage_match:
            try:
                return int(mileage_match.group(1).replace(',', ''))
            except ValueError:
                pass
        return 0