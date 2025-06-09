"""
Enhanced Copart Scraper with Dynamic Content Handling
Implements Selenium/Playwright for complete vehicle data extraction from insurance auctions
"""

import asyncio
import json
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import re

from playwright.async_api import async_playwright, Page, Browser
from bs4 import BeautifulSoup
import logging

from .base_scraper import BaseScraper, ScrapingResult

@dataclass
class CopartVehicle:
    """Structured Copart vehicle data"""
    lot_number: str
    make: str
    model: str
    year: int
    vin: str
    engine: str
    transmission: str
    drive_type: str
    fuel_type: str
    mileage: int
    damage_description: str
    damage_severity: str
    sale_date: str
    current_bid: float
    buy_it_now_price: Optional[float]
    estimated_value: float
    location: str
    seller: str
    title_type: str
    images: List[str]
    condition_report: Dict[str, Any]
    auction_status: str
    reserve_met: bool

class EnhancedCopartScraper(BaseScraper):
    """Enhanced Copart scraper with dynamic content handling"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.target_makes = config.get('target_makes', [
            'Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru',  # JDM
            'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Volkswagen',  # European
            'Lexus', 'Infiniti', 'Acura'  # Luxury Japanese
        ])
        self.target_models = config.get('target_models', [
            'Skyline', 'GT-R', 'Supra', 'NSX', 'RX-7', 'RX-8', 'Evo', 'STI',
            'M3', 'M5', 'AMG', 'RS4', 'RS6', 'Quattro', '911', 'Cayman'
        ])
        self.max_pages = config.get('max_pages', 10)
        self.delay_range = (2, 5)
        
    async def scrape(self) -> ScrapingResult:
        """Main scraping method with Playwright for dynamic content"""
        start_time = time.time()
        all_vehicles = []
        errors = []
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-setuid-sandbox']
                )
                
                for make in self.target_makes:
                    try:
                        vehicles = await self._scrape_make(browser, make)
                        all_vehicles.extend(vehicles)
                        self.logger.info(f"Scraped {len(vehicles)} vehicles for {make}")
                        
                        # Respectful delay between makes
                        await asyncio.sleep(self.delay_range[1])
                        
                    except Exception as e:
                        error_msg = f"Failed to scrape {make}: {str(e)}"
                        errors.append(error_msg)
                        self.logger.error(error_msg)
                
                await browser.close()
                
        except Exception as e:
            error_msg = f"Browser initialization failed: {str(e)}"
            errors.append(error_msg)
            self.logger.error(error_msg)
        
        execution_time = time.time() - start_time
        
        return ScrapingResult(
            success=len(all_vehicles) > 0,
            data=[vehicle.__dict__ for vehicle in all_vehicles],
            errors=errors,
            source="copart_enhanced",
            records_found=len(all_vehicles),
            execution_time=execution_time,
            metadata={
                "target_makes": self.target_makes,
                "pages_scraped": self.max_pages * len(self.target_makes),
                "dynamic_content": True
            }
        )
    
    async def _scrape_make(self, browser: Browser, make: str) -> List[CopartVehicle]:
        """Scrape all vehicles for a specific make"""
        vehicles = []
        
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        # Set realistic headers
        await page.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        
        try:
            # Build search URL for specific make
            search_url = f"https://www.copart.com/lotSearchResults/?free=true&query={make.lower()}"
            
            await page.goto(search_url, wait_until='networkidle', timeout=30000)
            
            # Wait for vehicle listings to load
            await page.wait_for_selector('[data-uname*="lot"], .lot-item, .vehicle-card', timeout=10000)
            
            # Scroll to load all content
            await self._scroll_page(page)
            
            # Extract vehicle data from current page
            page_vehicles = await self._extract_vehicles_from_page(page)
            vehicles.extend(page_vehicles)
            
            # Handle pagination if available
            for page_num in range(2, self.max_pages + 1):
                try:
                    # Look for next page button or pagination
                    next_button = await page.query_selector('a[aria-label="Next"], .pagination-next, [data-uname="next"]')
                    
                    if not next_button:
                        break
                    
                    await next_button.click()
                    await page.wait_for_load_state('networkidle')
                    await asyncio.sleep(self.delay_range[0])
                    
                    page_vehicles = await self._extract_vehicles_from_page(page)
                    vehicles.extend(page_vehicles)
                    
                except Exception as e:
                    self.logger.warning(f"Pagination failed on page {page_num} for {make}: {str(e)}")
                    break
                    
        except Exception as e:
            self.logger.error(f"Failed to scrape {make}: {str(e)}")
        
        finally:
            await page.close()
        
        return vehicles
    
    async def _scroll_page(self, page: Page):
        """Scroll page to trigger dynamic content loading"""
        try:
            # Scroll down in steps to trigger lazy loading
            for i in range(3):
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                await asyncio.sleep(1)
                
            # Scroll back to top
            await page.evaluate('window.scrollTo(0, 0)')
            await asyncio.sleep(1)
            
        except Exception as e:
            self.logger.warning(f"Scrolling failed: {str(e)}")
    
    async def _extract_vehicles_from_page(self, page: Page) -> List[CopartVehicle]:
        """Extract all vehicle data from current page"""
        vehicles = []
        
        try:
            # Get page content after dynamic loading
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Multiple selectors for vehicle cards
            vehicle_selectors = [
                '[data-uname*="lot"]',
                '.lot-item',
                '.vehicle-card',
                '.search-result-item',
                '[data-lot-number]'
            ]
            
            vehicle_elements = []
            for selector in vehicle_selectors:
                elements = await page.query_selector_all(selector)
                if elements:
                    vehicle_elements = elements
                    break
            
            if not vehicle_elements:
                # Fallback to parsing HTML directly
                vehicle_elements = soup.find_all(['div', 'article'], attrs={
                    'class': re.compile(r'(lot|vehicle|search-result)', re.I)
                })
            
            for element in vehicle_elements:
                try:
                    vehicle_data = await self._extract_single_vehicle(page, element)
                    if vehicle_data and self._is_target_vehicle(vehicle_data):
                        vehicles.append(vehicle_data)
                        
                except Exception as e:
                    self.logger.warning(f"Failed to extract vehicle: {str(e)}")
                    continue
                    
        except Exception as e:
            self.logger.error(f"Page extraction failed: {str(e)}")
        
        return vehicles
    
    async def _extract_single_vehicle(self, page: Page, element) -> Optional[CopartVehicle]:
        """Extract data from a single vehicle element"""
        try:
            # Try to get element handle for Playwright operations
            if hasattr(element, 'get_attribute'):
                # Playwright element
                element_handle = element
            else:
                # BeautifulSoup element - find corresponding Playwright element
                lot_number = element.get('data-lot-number') or \
                           (element.find(attrs={'data-lot-number': True}) or {}).get('data-lot-number')
                
                if lot_number:
                    element_handle = await page.query_selector(f'[data-lot-number="{lot_number}"]')
                else:
                    return None
            
            if not element_handle:
                return None
            
            # Extract basic vehicle info
            lot_number = await self._safe_get_attribute(element_handle, 'data-lot-number', '')
            
            # Get text content
            text_content = await element_handle.inner_text() if element_handle else ''
            
            # Parse vehicle details from text
            make, model, year = self._parse_vehicle_title(text_content)
            vin = self._extract_vin_from_text(text_content)
            mileage = self._extract_mileage_from_text(text_content)
            
            # Extract pricing information
            current_bid = self._extract_price_from_text(text_content, 'current bid')
            buy_it_now = self._extract_price_from_text(text_content, 'buy it now')
            
            # Extract damage information
            damage_desc = self._extract_damage_description(text_content)
            damage_severity = self._assess_damage_severity(damage_desc)
            
            # Extract location
            location = self._extract_location_from_text(text_content)
            
            # Create vehicle object
            vehicle = CopartVehicle(
                lot_number=lot_number,
                make=make,
                model=model,
                year=year,
                vin=vin,
                engine='',  # Extract if available
                transmission='',  # Extract if available
                drive_type='',  # Extract if available
                fuel_type='',  # Extract if available
                mileage=mileage,
                damage_description=damage_desc,
                damage_severity=damage_severity,
                sale_date='',  # Extract if available
                current_bid=current_bid,
                buy_it_now_price=buy_it_now,
                estimated_value=current_bid * 1.2 if current_bid > 0 else 0,
                location=location,
                seller='Copart',
                title_type='',  # Extract if available
                images=[],  # Extract if needed
                condition_report={},  # Extract if available
                auction_status='active',
                reserve_met=False  # Extract if available
            )
            
            return vehicle
            
        except Exception as e:
            self.logger.warning(f"Single vehicle extraction failed: {str(e)}")
            return None
    
    async def _safe_get_attribute(self, element, attr: str, default: str = '') -> str:
        """Safely get attribute from Playwright element"""
        try:
            value = await element.get_attribute(attr)
            return value or default
        except:
            return default
    
    def _parse_vehicle_title(self, text: str) -> tuple[str, str, int]:
        """Parse make, model, year from vehicle title"""
        # Common patterns for vehicle titles
        year_pattern = r'\b(19|20)\d{2}\b'
        
        # Extract year
        year_match = re.search(year_pattern, text)
        year = int(year_match.group()) if year_match else 0
        
        # Known makes pattern
        makes_pattern = '|'.join(self.target_makes)
        make_match = re.search(f'\\b({makes_pattern})\\b', text, re.IGNORECASE)
        make = make_match.group(1) if make_match else ''
        
        # Extract model (text after make, before year)
        model = ''
        if make and year:
            # Find text between make and year
            make_pos = text.lower().find(make.lower())
            year_pos = text.find(str(year))
            
            if make_pos >= 0 and year_pos > make_pos:
                model_text = text[make_pos + len(make):year_pos].strip()
                model = re.sub(r'[^\w\s-]', '', model_text).strip()
        
        return make, model, year
    
    def _extract_vin_from_text(self, text: str) -> str:
        """Extract VIN from text"""
        vin_pattern = r'\b[A-HJ-NPR-Z0-9]{17}\b'
        match = re.search(vin_pattern, text)
        return match.group() if match else ''
    
    def _extract_mileage_from_text(self, text: str) -> int:
        """Extract mileage from text"""
        mileage_patterns = [
            r'(\d{1,3}(?:,\d{3})*)\s*mi',
            r'(\d{1,3}(?:,\d{3})*)\s*miles',
            r'(\d{1,3}(?:,\d{3})*)\s*km'
        ]
        
        for pattern in mileage_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1).replace(',', ''))
        
        return 0
    
    def _extract_price_from_text(self, text: str, price_type: str) -> float:
        """Extract price from text"""
        price_pattern = r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
        
        # Look for price near the specified type
        type_pos = text.lower().find(price_type.lower())
        if type_pos >= 0:
            # Search in vicinity of price type
            vicinity = text[max(0, type_pos-50):type_pos+100]
            match = re.search(price_pattern, vicinity)
            if match:
                return float(match.group(1).replace(',', ''))
        
        # Fallback to any price in text
        match = re.search(price_pattern, text)
        return float(match.group(1).replace(',', '')) if match else 0.0
    
    def _extract_damage_description(self, text: str) -> str:
        """Extract damage description from text"""
        damage_keywords = [
            'front end', 'rear end', 'side damage', 'flood', 'fire',
            'collision', 'hail', 'vandalism', 'theft', 'mechanical',
            'minor damage', 'major damage', 'total loss'
        ]
        
        for keyword in damage_keywords:
            if keyword in text.lower():
                return keyword.title()
        
        return 'Unknown'
    
    def _assess_damage_severity(self, damage_desc: str) -> str:
        """Assess damage severity from description"""
        minor_keywords = ['minor', 'light', 'superficial', 'cosmetic']
        major_keywords = ['major', 'severe', 'total loss', 'flood', 'fire']
        
        damage_lower = damage_desc.lower()
        
        for keyword in major_keywords:
            if keyword in damage_lower:
                return 'Major'
        
        for keyword in minor_keywords:
            if keyword in damage_lower:
                return 'Minor'
        
        return 'Moderate'
    
    def _extract_location_from_text(self, text: str) -> str:
        """Extract location from text"""
        # US state abbreviations pattern
        state_pattern = r'\b[A-Z]{2}\b'
        
        # Look for common location patterns
        location_patterns = [
            r'([A-Z][a-z]+,\s*[A-Z]{2})',  # City, ST
            r'([A-Z]{2})\s*-\s*([A-Z][a-z]+)',  # ST - City
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group()
        
        # Fallback to state abbreviation
        match = re.search(state_pattern, text)
        return match.group() if match else ''
    
    def _is_target_vehicle(self, vehicle: CopartVehicle) -> bool:
        """Check if vehicle matches target criteria"""
        # Must have basic info
        if not vehicle.make or not vehicle.year or vehicle.year < 1990:
            return False
        
        # Must be target make
        if vehicle.make not in self.target_makes:
            return False
        
        # Prefer target models if specified
        if self.target_models:
            for target_model in self.target_models:
                if target_model.lower() in vehicle.model.lower():
                    return True
        
        # Accept all vehicles from target makes if no specific models
        return True
    
    def validate_data(self, data: Dict[str, Any]) -> bool:
        """Validate extracted vehicle data"""
        required_fields = ['lot_number', 'make', 'year']
        
        for field in required_fields:
            if not data.get(field):
                return False
        
        # Year validation
        year = data.get('year', 0)
        if not isinstance(year, int) or year < 1990 or year > 2025:
            return False
        
        return True
    
    def clean_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and normalize vehicle data"""
        cleaned = data.copy()
        
        # Normalize make/model
        if 'make' in cleaned:
            cleaned['make'] = cleaned['make'].title().strip()
        
        if 'model' in cleaned:
            cleaned['model'] = cleaned['model'].title().strip()
        
        # Ensure numeric fields
        numeric_fields = ['year', 'mileage', 'current_bid', 'estimated_value']
        for field in numeric_fields:
            if field in cleaned:
                try:
                    cleaned[field] = float(cleaned[field]) if cleaned[field] else 0
                except (ValueError, TypeError):
                    cleaned[field] = 0
        
        # Clean text fields
        text_fields = ['damage_description', 'location', 'vin']
        for field in text_fields:
            if field in cleaned and cleaned[field]:
                cleaned[field] = str(cleaned[field]).strip()
        
        return cleaned