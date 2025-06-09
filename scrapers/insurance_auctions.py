"""
Insurance Auction Scraper
Scrapes public vehicle listings from insurance auction platforms like Copart and IAA
"""

import re
from bs4 import BeautifulSoup
from typing import Dict, List, Any
from .base_scraper import BaseScraper, ScrapingResult
import time
from datetime import datetime
import json

class InsuranceAuctionScraper(BaseScraper):
    """Scraper for insurance auction platforms"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.auction_sources = config.get('auction_sources', {
            'copart': {
                'base_url': 'https://www.copart.com',
                'search_path': '/public/vehicleFinder/search',
                'params': {'sortBy': 'auction_date_type desc', 'size': '100'}
            },
            'iaa': {
                'base_url': 'https://www.iaai.com',
                'search_path': '/VehicleListing',
                'params': {'vehicleType': 'automobile'}
            }
        })
    
    def scrape(self) -> ScrapingResult:
        """Main scraping method for insurance auctions"""
        start_time = time.time()
        all_data = []
        errors = []
        
        for source_name, source_config in self.auction_sources.items():
            try:
                self.logger.info(f"Scraping {source_name} insurance auctions...")
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
            source="insurance_auctions",
            records_found=len(all_data),
            execution_time=execution_time,
            metadata={
                'sources_scraped': list(self.auction_sources.keys()),
                'timestamp': datetime.now().isoformat()
            }
        )
    
    def _scrape_source(self, source_name: str, source_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scrape a specific insurance auction source"""
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
        """Parse HTML content to extract insurance auction data"""
        soup = BeautifulSoup(html_content, 'html.parser')
        vehicles = []
        
        # Copart parsing
        if 'copart.com' in url:
            vehicles.extend(self._parse_copart_auctions(soup, url))
        
        # IAA parsing
        elif 'iaai.com' in url:
            vehicles.extend(self._parse_iaa_auctions(soup, url))
        
        # Generic insurance auction parsing
        else:
            vehicles.extend(self._parse_generic_insurance_auction(soup, url))
        
        return vehicles
    
    def _parse_copart_auctions(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Parse Copart auction listings"""
        vehicles = []
        
        # Look for vehicle listing containers
        listings = soup.find_all(['div', 'tr'], class_=re.compile(r'vehicle|listing|lot'))
        
        # Also check for JSON data in script tags
        script_tags = soup.find_all('script', string=re.compile(r'vehicle|lot'))
        for script in script_tags:
            try:
                # Extract JSON data if present
                json_match = re.search(r'({.*"vehicles".*})', script.string)
                if json_match:
                    data = json.loads(json_match.group(1))
                    if 'vehicles' in data:
                        for vehicle in data['vehicles'][:50]:  # Limit to 50 vehicles
                            vehicle_data = self._parse_copart_json_vehicle(vehicle)
                            if vehicle_data and self.validate_data(vehicle_data):
                                vehicles.append(self.clean_data(vehicle_data))
            except (json.JSONDecodeError, KeyError):
                continue
        
        # Parse HTML listings if no JSON found
        if not vehicles:
            for listing in listings:
                try:
                    # Extract vehicle title/description
                    title_elem = listing.find(['h3', 'h4', 'a', 'span'], string=re.compile(r'[0-9]{4}', re.I))
                    if not title_elem:
                        continue
                    
                    title = title_elem.get_text(strip=True)
                    
                    # Extract year, make, model
                    year_match = re.search(r'\b(19|20)\d{2}\b', title)
                    year = int(year_match.group()) if year_match else None
                    
                    make = self._extract_make_from_title(title)
                    model = self._extract_model_from_title(title, make)
                    
                    # Extract lot number
                    lot_elem = listing.find(['span', 'div'], string=re.compile(r'lot', re.I))
                    lot_number = self._extract_lot_number(lot_elem.get_text() if lot_elem else '')
                    
                    # Extract VIN
                    vin_elem = listing.find(['span', 'div'], string=re.compile(r'VIN', re.I))
                    vin = self._extract_vin(vin_elem.get_text() if vin_elem else '')
                    
                    # Extract damage description
                    damage_elem = listing.find(['span', 'div'], string=re.compile(r'damage|condition', re.I))
                    damage = damage_elem.get_text(strip=True) if damage_elem else 'Unknown'
                    
                    # Extract sale date
                    date_elem = listing.find(['span', 'div'], string=re.compile(r'sale|auction', re.I))
                    sale_date = self._extract_date(date_elem.get_text() if date_elem else '')
                    
                    # Extract current bid
                    bid_elem = listing.find(['span', 'div'], string=re.compile(r'\$[\d,]+'))
                    current_bid = self._extract_price(bid_elem.get_text() if bid_elem else '')
                    
                    vehicle_data = {
                        'title': title,
                        'make': make,
                        'model': model,
                        'year': year,
                        'vin': vin,
                        'lot_number': lot_number,
                        'current_bid': current_bid,
                        'damage_description': damage,
                        'sale_date': sale_date,
                        'source': 'Copart',
                        'url': url,
                        'condition': 'Salvage/Insurance Total',
                        'auction_type': 'Insurance Auction',
                        'scraped_at': datetime.now().isoformat()
                    }
                    
                    if self.validate_data(vehicle_data):
                        vehicles.append(self.clean_data(vehicle_data))
                
                except Exception as e:
                    self.logger.warning(f"Error parsing Copart listing: {str(e)}")
                    continue
        
        return vehicles
    
    def _parse_copart_json_vehicle(self, vehicle_json: Dict[str, Any]) -> Dict[str, Any]:
        """Parse vehicle data from Copart JSON"""
        try:
            return {
                'title': f"{vehicle_json.get('year', '')} {vehicle_json.get('make', '')} {vehicle_json.get('model', '')}".strip(),
                'make': vehicle_json.get('make', ''),
                'model': vehicle_json.get('model', ''),
                'year': vehicle_json.get('year'),
                'vin': vehicle_json.get('vin', ''),
                'lot_number': vehicle_json.get('lotNumber', ''),
                'current_bid': vehicle_json.get('currentBid', 0),
                'damage_description': vehicle_json.get('primaryDamage', 'Unknown'),
                'sale_date': vehicle_json.get('saleDate', ''),
                'source': 'Copart',
                'condition': 'Salvage/Insurance Total',
                'auction_type': 'Insurance Auction',
                'scraped_at': datetime.now().isoformat()
            }
        except Exception:
            return {}
    
    def _parse_iaa_auctions(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Parse IAA auction listings"""
        vehicles = []
        
        # Look for vehicle listing containers
        listings = soup.find_all(['div', 'tr'], class_=re.compile(r'vehicle|listing|auction'))
        
        for listing in listings:
            try:
                # Extract vehicle information
                title_elem = listing.find(['a', 'h3', 'h4'])
                if not title_elem:
                    continue
                
                title = title_elem.get_text(strip=True)
                
                # Skip non-vehicle items
                if not re.search(r'(?i)(19|20)\d{2}', title):
                    continue
                
                # Extract details
                year_match = re.search(r'\b(19|20)\d{2}\b', title)
                year = int(year_match.group()) if year_match else None
                
                make = self._extract_make_from_title(title)
                model = self._extract_model_from_title(title, make)
                
                # Extract VIN
                vin_elem = listing.find(['span', 'div'], string=re.compile(r'VIN', re.I))
                vin = self._extract_vin(vin_elem.get_text() if vin_elem else '')
                
                # Extract stock number
                stock_elem = listing.find(['span', 'div'], string=re.compile(r'stock|lot', re.I))
                stock_number = re.search(r'\d+', stock_elem.get_text() if stock_elem else '').group() if stock_elem else ''
                
                # Extract current bid
                bid_elem = listing.find(['span', 'div'], string=re.compile(r'\$[\d,]+'))
                current_bid = self._extract_price(bid_elem.get_text() if bid_elem else '')
                
                # Extract damage type
                damage_elem = listing.find(['span', 'div'], string=re.compile(r'damage|loss', re.I))
                damage = damage_elem.get_text(strip=True) if damage_elem else 'Unknown'
                
                vehicle_data = {
                    'title': title,
                    'make': make,
                    'model': model,
                    'year': year,
                    'vin': vin,
                    'stock_number': stock_number,
                    'current_bid': current_bid,
                    'damage_description': damage,
                    'source': 'IAA',
                    'url': url,
                    'condition': 'Salvage/Insurance Total',
                    'auction_type': 'Insurance Auction',
                    'scraped_at': datetime.now().isoformat()
                }
                
                if self.validate_data(vehicle_data):
                    vehicles.append(self.clean_data(vehicle_data))
            
            except Exception as e:
                self.logger.warning(f"Error parsing IAA listing: {str(e)}")
                continue
        
        return vehicles
    
    def _parse_generic_insurance_auction(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Generic parser for insurance auction sites"""
        vehicles = []
        
        # Look for vehicle-related content
        vehicle_elements = soup.find_all(['div', 'tr', 'li'], string=re.compile(r'(?i)(19|20)\d{2}.*(toyota|honda|nissan|ford|chevrolet|bmw)', re.I))
        
        for element in vehicle_elements[:30]:  # Limit to first 30 matches
            try:
                text = element.get_text(strip=True)
                
                # Extract vehicle details
                year_match = re.search(r'\b(19|20)\d{2}\b', text)
                year = int(year_match.group()) if year_match else None
                
                make = self._extract_make_from_title(text)
                if not make or make == 'Unknown':
                    continue
                
                model = self._extract_model_from_title(text, make)
                price = self._extract_price(text)
                
                vehicle_data = {
                    'title': text[:100],  # First 100 chars
                    'make': make,
                    'model': model,
                    'year': year,
                    'current_bid': price,
                    'source': 'Insurance Auction',
                    'url': url,
                    'condition': 'Salvage/Insurance Total',
                    'auction_type': 'Insurance Auction',
                    'scraped_at': datetime.now().isoformat()
                }
                
                if self.validate_data(vehicle_data):
                    vehicles.append(self.clean_data(vehicle_data))
            
            except Exception as e:
                self.logger.warning(f"Error parsing generic insurance auction item: {str(e)}")
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
        # Remove make and year from title
        title_clean = re.sub(rf'\b{make}\b', '', title, flags=re.I)
        title_clean = re.sub(r'\b(19|20)\d{2}\b', '', title_clean)
        
        # Look for model patterns
        words = title_clean.split()
        for word in words:
            if len(word) > 2 and word.isalnum():
                return word.strip()
        
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
    
    def _extract_lot_number(self, text: str) -> str:
        """Extract lot number from text"""
        lot_match = re.search(r'(?:lot|#)\s*(\d+)', text, re.I)
        return lot_match.group(1) if lot_match else ''