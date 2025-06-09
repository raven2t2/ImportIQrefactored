"""
Enhanced HTS USITC Scraper for Complete Vehicle Tariff Database
Extracts ALL vehicle HTS codes (8703.xx series) with duty rates, effective dates, and country-specific rates
"""

import asyncio
import json
import time
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import urllib.parse

from playwright.async_api import async_playwright, Page, Browser
from bs4 import BeautifulSoup
import logging

from .base_scraper import BaseScraper, ScrapingResult

@dataclass
class HTSVehicleCode:
    """Structured HTS vehicle tariff data"""
    hts_code: str
    description: str
    duty_rate_general: str
    duty_rate_special: str
    country_specific_rates: Dict[str, str]
    unit_of_quantity: str
    effective_date: str
    category: str  # passenger_car, commercial_vehicle, motorcycle, etc.
    engine_size_category: str  # under_3000cc, over_3000cc, etc.
    value_threshold: Optional[float]
    additional_fees: List[str]
    notes: str
    last_updated: str

class EnhancedHTSScraper(BaseScraper):
    """Enhanced HTS scraper for comprehensive vehicle tariff extraction"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.base_url = "https://hts.usitc.gov"
        self.vehicle_chapters = [
            "8703",  # Motor cars and other motor vehicles for transport of persons
            "8704",  # Motor vehicles for transport of goods
            "8711",  # Motorcycles and cycles with auxiliary motor
            "8716",  # Trailers and semi-trailers
        ]
        self.max_retries = 3
        self.delay_range = (3, 6)
        
    async def scrape(self) -> ScrapingResult:
        """Main scraping method for HTS vehicle codes"""
        start_time = time.time()
        all_codes = []
        errors = []
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-setuid-sandbox']
                )
                
                for chapter in self.vehicle_chapters:
                    try:
                        codes = await self._scrape_chapter(browser, chapter)
                        all_codes.extend(codes)
                        self.logger.info(f"Scraped {len(codes)} HTS codes for chapter {chapter}")
                        
                        # Respectful delay between chapters
                        await asyncio.sleep(self.delay_range[1])
                        
                    except Exception as e:
                        error_msg = f"Failed to scrape chapter {chapter}: {str(e)}"
                        errors.append(error_msg)
                        self.logger.error(error_msg)
                
                await browser.close()
                
        except Exception as e:
            error_msg = f"Browser initialization failed: {str(e)}"
            errors.append(error_msg)
            self.logger.error(error_msg)
        
        execution_time = time.time() - start_time
        
        return ScrapingResult(
            success=len(all_codes) > 0,
            data=[code.__dict__ for code in all_codes],
            errors=errors,
            source="hts_usitc_enhanced",
            records_found=len(all_codes),
            execution_time=execution_time,
            metadata={
                "chapters_scraped": self.vehicle_chapters,
                "comprehensive_extraction": True,
                "duty_calculation_ready": True
            }
        )
    
    async def _scrape_chapter(self, browser: Browser, chapter: str) -> List[HTSVehicleCode]:
        """Scrape all HTS codes for a specific chapter"""
        codes = []
        
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        # Set realistic headers
        await page.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': 'https://hts.usitc.gov/',
        })
        
        try:
            # Navigate to HTS search for specific chapter
            search_url = f"{self.base_url}/view/chapter?release=2024HTSARev2&chapter={chapter}"
            
            await page.goto(search_url, wait_until='networkidle', timeout=30000)
            
            # Wait for content to load
            await page.wait_for_selector('table, .hts-table, [data-hts]', timeout=10000)
            
            # Extract all HTS codes from chapter page
            chapter_codes = await self._extract_codes_from_chapter(page, chapter)
            codes.extend(chapter_codes)
            
            # For each main code, drill down into subcodes
            for main_code in chapter_codes:
                if self._has_subcodes(main_code.hts_code):
                    try:
                        subcodes = await self._scrape_subcodes(page, main_code.hts_code)
                        codes.extend(subcodes)
                        await asyncio.sleep(self.delay_range[0])
                    except Exception as e:
                        self.logger.warning(f"Failed to scrape subcodes for {main_code.hts_code}: {str(e)}")
                        
        except Exception as e:
            self.logger.error(f"Failed to scrape chapter {chapter}: {str(e)}")
        
        finally:
            await page.close()
        
        return codes
    
    async def _extract_codes_from_chapter(self, page: Page, chapter: str) -> List[HTSVehicleCode]:
        """Extract HTS codes from chapter overview page"""
        codes = []
        
        try:
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Look for HTS code tables
            tables = soup.find_all('table')
            
            for table in tables:
                rows = table.find_all('tr')
                
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    
                    if len(cells) >= 4:  # Minimum expected columns
                        hts_code_cell = cells[0]
                        description_cell = cells[1] if len(cells) > 1 else None
                        duty_cell = cells[2] if len(cells) > 2 else None
                        
                        hts_code = self._clean_hts_code(hts_code_cell.get_text(strip=True))
                        
                        if self._is_vehicle_hts_code(hts_code):
                            vehicle_code = await self._extract_detailed_hts_info(page, hts_code, cells)
                            if vehicle_code:
                                codes.append(vehicle_code)
            
            # Also look for nested code structures
            code_elements = soup.find_all(attrs={'data-hts-code': True})
            for element in code_elements:
                hts_code = element.get('data-hts-code', '')
                if self._is_vehicle_hts_code(hts_code):
                    vehicle_code = await self._extract_hts_from_element(page, element)
                    if vehicle_code:
                        codes.append(vehicle_code)
                        
        except Exception as e:
            self.logger.error(f"Failed to extract codes from chapter {chapter}: {str(e)}")
        
        return codes
    
    async def _extract_detailed_hts_info(self, page: Page, hts_code: str, cells: List) -> Optional[HTSVehicleCode]:
        """Extract detailed HTS information from table cells"""
        try:
            # Extract basic info from cells
            description = cells[1].get_text(strip=True) if len(cells) > 1 else ""
            duty_general = cells[2].get_text(strip=True) if len(cells) > 2 else ""
            duty_special = cells[3].get_text(strip=True) if len(cells) > 3 else ""
            unit = cells[4].get_text(strip=True) if len(cells) > 4 else ""
            
            # Try to click on code for more details
            detailed_info = await self._get_detailed_code_info(page, hts_code)
            
            # Categorize vehicle type
            category = self._categorize_vehicle_by_description(description)
            engine_category = self._extract_engine_category(description)
            
            # Extract country-specific rates
            country_rates = self._extract_country_specific_rates(cells)
            
            # Parse duty rates
            duty_general_clean = self._parse_duty_rate(duty_general)
            duty_special_clean = self._parse_duty_rate(duty_special)
            
            # Extract additional fees information
            additional_fees = self._extract_additional_fees(description, detailed_info)
            
            # Determine value thresholds
            value_threshold = self._extract_value_threshold(description)
            
            vehicle_code = HTSVehicleCode(
                hts_code=hts_code,
                description=description,
                duty_rate_general=duty_general_clean,
                duty_rate_special=duty_special_clean,
                country_specific_rates=country_rates,
                unit_of_quantity=unit,
                effective_date=detailed_info.get('effective_date', ''),
                category=category,
                engine_size_category=engine_category,
                value_threshold=value_threshold,
                additional_fees=additional_fees,
                notes=detailed_info.get('notes', ''),
                last_updated=datetime.now().isoformat()
            )
            
            return vehicle_code
            
        except Exception as e:
            self.logger.warning(f"Failed to extract detailed info for {hts_code}: {str(e)}")
            return None
    
    async def _get_detailed_code_info(self, page: Page, hts_code: str) -> Dict[str, Any]:
        """Get detailed information by navigating to specific HTS code page"""
        detailed_info = {}
        
        try:
            # Try to find and click on the HTS code link
            code_link = await page.query_selector(f'a[href*="{hts_code}"], a:text("{hts_code}")')
            
            if code_link:
                # Open in new tab to preserve current page
                new_page = await page.context.new_page()
                
                try:
                    await code_link.click()
                    await new_page.wait_for_load_state('networkidle', timeout=10000)
                    
                    # Extract additional details from detailed page
                    content = await new_page.content()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Look for effective dates
                    date_element = soup.find(text=re.compile(r'effective|date', re.I))
                    if date_element:
                        detailed_info['effective_date'] = self._extract_date_from_text(str(date_element))
                    
                    # Look for notes or special provisions
                    notes_element = soup.find(['div', 'p'], class_=re.compile(r'note|provision', re.I))
                    if notes_element:
                        detailed_info['notes'] = notes_element.get_text(strip=True)
                    
                    # Look for country-specific information
                    country_table = soup.find('table', class_=re.compile(r'country|rate', re.I))
                    if country_table:
                        detailed_info['country_rates'] = self._parse_country_rate_table(country_table)
                        
                finally:
                    await new_page.close()
                    
        except Exception as e:
            self.logger.debug(f"Could not get detailed info for {hts_code}: {str(e)}")
        
        return detailed_info
    
    async def _scrape_subcodes(self, page: Page, parent_code: str) -> List[HTSVehicleCode]:
        """Scrape subcodes for a parent HTS code"""
        subcodes = []
        
        try:
            # Navigate to subcode page
            subcode_url = f"{self.base_url}/view/subcodes?release=2024HTSARev2&code={parent_code}"
            await page.goto(subcode_url, wait_until='networkidle', timeout=15000)
            
            # Extract subcodes from the page
            subcodes = await self._extract_codes_from_chapter(page, parent_code)
            
        except Exception as e:
            self.logger.warning(f"Failed to scrape subcodes for {parent_code}: {str(e)}")
        
        return subcodes
    
    def _clean_hts_code(self, raw_code: str) -> str:
        """Clean and normalize HTS code"""
        # Remove extra whitespace and formatting
        code = re.sub(r'\s+', '', raw_code)
        # Remove non-alphanumeric characters except dots
        code = re.sub(r'[^0-9.]', '', code)
        return code
    
    def _is_vehicle_hts_code(self, hts_code: str) -> bool:
        """Check if HTS code is vehicle-related"""
        vehicle_prefixes = ['8703', '8704', '8711', '8716']
        return any(hts_code.startswith(prefix) for prefix in vehicle_prefixes)
    
    def _categorize_vehicle_by_description(self, description: str) -> str:
        """Categorize vehicle type from description"""
        desc_lower = description.lower()
        
        if any(word in desc_lower for word in ['passenger', 'sedan', 'coupe', 'hatchback']):
            return 'passenger_car'
        elif any(word in desc_lower for word in ['commercial', 'truck', 'van', 'goods']):
            return 'commercial_vehicle'
        elif any(word in desc_lower for word in ['motorcycle', 'cycle', 'bike']):
            return 'motorcycle'
        elif any(word in desc_lower for word in ['trailer', 'semi-trailer']):
            return 'trailer'
        elif any(word in desc_lower for word in ['suv', 'utility', 'sport']):
            return 'suv'
        else:
            return 'other'
    
    def _extract_engine_category(self, description: str) -> str:
        """Extract engine size category from description"""
        desc_lower = description.lower()
        
        # Look for specific engine size mentions
        if 'under 3,000 cc' in desc_lower or 'less than 3000cc' in desc_lower:
            return 'under_3000cc'
        elif 'over 3,000 cc' in desc_lower or 'more than 3000cc' in desc_lower:
            return 'over_3000cc'
        elif 'electric' in desc_lower or 'ev' in desc_lower:
            return 'electric'
        elif 'hybrid' in desc_lower:
            return 'hybrid'
        else:
            return 'unspecified'
    
    def _parse_duty_rate(self, duty_text: str) -> str:
        """Parse and clean duty rate text"""
        if not duty_text:
            return "0%"
        
        # Extract percentage or specific rate
        percentage_match = re.search(r'(\d+(?:\.\d+)?)\s*%', duty_text)
        if percentage_match:
            return f"{percentage_match.group(1)}%"
        
        # Extract dollar amounts
        dollar_match = re.search(r'\$(\d+(?:\.\d+)?)', duty_text)
        if dollar_match:
            return f"${dollar_match.group(1)}"
        
        # Extract "per unit" rates
        per_unit_match = re.search(r'(\d+(?:\.\d+)?)\s*¢?\s*per', duty_text, re.I)
        if per_unit_match:
            return f"{per_unit_match.group(1)}¢ per unit"
        
        return duty_text.strip()
    
    def _extract_country_specific_rates(self, cells: List) -> Dict[str, str]:
        """Extract country-specific duty rates from table cells"""
        country_rates = {}
        
        # Look for columns that might contain country codes or rates
        for i, cell in enumerate(cells[5:], 5):  # Skip first 5 standard columns
            cell_text = cell.get_text(strip=True)
            
            # Check if this looks like a country-specific rate
            if any(indicator in cell_text.lower() for indicator in ['canada', 'mexico', 'eu', 'japan', 'korea']):
                country_rates[f'column_{i}'] = cell_text
        
        return country_rates
    
    def _extract_additional_fees(self, description: str, detailed_info: Dict[str, Any]) -> List[str]:
        """Extract information about additional fees"""
        fees = []
        
        # Look for fee indicators in description
        fee_indicators = [
            'gas guzzler tax', 'luxury tax', 'environmental fee',
            'safety certification', 'emission standards'
        ]
        
        for indicator in fee_indicators:
            if indicator in description.lower():
                fees.append(indicator.title())
        
        # Check detailed info for additional fees
        if 'notes' in detailed_info:
            notes = detailed_info['notes'].lower()
            for indicator in fee_indicators:
                if indicator in notes and indicator.title() not in fees:
                    fees.append(indicator.title())
        
        return fees
    
    def _extract_value_threshold(self, description: str) -> Optional[float]:
        """Extract value thresholds that affect duty rates"""
        # Look for value thresholds in description
        value_patterns = [
            r'valued?\s*(?:at\s*)?(?:over|above|exceeding)\s*\$(\d+(?:,\d{3})*)',
            r'valued?\s*(?:at\s*)?(?:under|below|less\s*than)\s*\$(\d+(?:,\d{3})*)',
            r'\$(\d+(?:,\d{3})*)\s*or\s*(?:more|less)'
        ]
        
        for pattern in value_patterns:
            match = re.search(pattern, description, re.I)
            if match:
                return float(match.group(1).replace(',', ''))
        
        return None
    
    def _extract_date_from_text(self, text: str) -> str:
        """Extract date from text"""
        date_patterns = [
            r'(\d{1,2}/\d{1,2}/\d{4})',
            r'(\d{4}-\d{1,2}-\d{1,2})',
            r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                return match.group(1)
        
        return ''
    
    def _parse_country_rate_table(self, table) -> Dict[str, str]:
        """Parse country-specific rate table"""
        country_rates = {}
        
        rows = table.find_all('tr')
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                country = cells[0].get_text(strip=True)
                rate = cells[1].get_text(strip=True)
                
                if country and rate and country.lower() != 'country':
                    country_rates[country] = rate
        
        return country_rates
    
    def _has_subcodes(self, hts_code: str) -> bool:
        """Check if HTS code likely has subcodes to explore"""
        # Codes ending in .00 or with fewer than 10 digits often have subcodes
        return (hts_code.endswith('.00') or 
                len(hts_code.replace('.', '')) < 10 or
                hts_code.count('.') < 2)
    
    async def _extract_hts_from_element(self, page: Page, element) -> Optional[HTSVehicleCode]:
        """Extract HTS code information from a specific element"""
        try:
            hts_code = element.get('data-hts-code', '')
            description = element.get_text(strip=True)
            
            # Try to find associated duty information
            parent = element.find_parent()
            duty_elements = parent.find_all(text=re.compile(r'%|\$|duty|rate', re.I)) if parent else []
            
            duty_info = ' '.join(duty_elements[:2])  # Take first two relevant elements
            
            return HTSVehicleCode(
                hts_code=hts_code,
                description=description,
                duty_rate_general=self._parse_duty_rate(duty_info),
                duty_rate_special="",
                country_specific_rates={},
                unit_of_quantity="",
                effective_date="",
                category=self._categorize_vehicle_by_description(description),
                engine_size_category=self._extract_engine_category(description),
                value_threshold=self._extract_value_threshold(description),
                additional_fees=[],
                notes="",
                last_updated=datetime.now().isoformat()
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to extract from element: {str(e)}")
            return None
    
    def validate_data(self, data: Dict[str, Any]) -> bool:
        """Validate extracted HTS data"""
        required_fields = ['hts_code', 'description']
        
        for field in required_fields:
            if not data.get(field):
                return False
        
        # Validate HTS code format
        hts_code = data.get('hts_code', '')
        if not re.match(r'^87(03|04|11|16)\.', hts_code):
            return False
        
        return True
    
    def clean_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and normalize HTS data"""
        cleaned = data.copy()
        
        # Clean HTS code
        if 'hts_code' in cleaned:
            cleaned['hts_code'] = self._clean_hts_code(cleaned['hts_code'])
        
        # Clean description
        if 'description' in cleaned:
            cleaned['description'] = re.sub(r'\s+', ' ', cleaned['description']).strip()
        
        # Ensure duty rates are properly formatted
        for rate_field in ['duty_rate_general', 'duty_rate_special']:
            if rate_field in cleaned:
                cleaned[rate_field] = self._parse_duty_rate(cleaned[rate_field])
        
        return cleaned