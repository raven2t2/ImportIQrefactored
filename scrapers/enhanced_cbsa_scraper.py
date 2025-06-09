"""
Enhanced CBSA Scraper for Complete Canadian Import Requirements
Extracts RIV eligibility, documentation requirements, and Canada-specific import costs
"""

import asyncio
import json
import time
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from playwright.async_api import async_playwright, Page, Browser
from bs4 import BeautifulSoup
import logging

from .base_scraper import BaseScraper, ScrapingResult

@dataclass
class CanadianImportRequirement:
    """Structured Canadian vehicle import requirement data"""
    make: str
    model: str
    year_range: str
    riv_eligible: bool
    riv_category: str  # admissible, inadmissible, conditional
    required_documents: List[str]
    modification_requirements: List[str]
    estimated_cost_cad: float
    duty_rate: str
    gst_rate: str
    inspection_requirements: List[str]
    timeline_days: int
    provincial_requirements: Dict[str, List[str]]
    recall_clearance_required: bool
    emissions_compliance: str
    safety_standards: List[str]
    notes: str
    source_url: str
    last_updated: str

class EnhancedCBSAScraper(BaseScraper):
    """Enhanced CBSA scraper for comprehensive Canadian import requirements"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.base_urls = [
            "https://www.cbsa-asfc.gc.ca/travel-voyage/ido-bdo/ivc-rvc/menu-eng.html",
            "https://www.tc.gc.ca/en/services/road/importing-vehicle.html",
            "https://www.riv.ca/ImportVehicle.aspx"
        ]
        self.target_makes = config.get('target_makes', [
            'Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru',
            'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Volkswagen',
            'Lexus', 'Infiniti', 'Acura'
        ])
        self.delay_range = (3, 6)
        
    async def scrape(self) -> ScrapingResult:
        """Main scraping method for Canadian import requirements"""
        start_time = time.time()
        all_requirements = []
        errors = []
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-setuid-sandbox']
                )
                
                # Scrape each source
                for url in self.base_urls:
                    try:
                        requirements = await self._scrape_source(browser, url)
                        all_requirements.extend(requirements)
                        self.logger.info(f"Scraped {len(requirements)} requirements from {url}")
                        
                        await asyncio.sleep(self.delay_range[1])
                        
                    except Exception as e:
                        error_msg = f"Failed to scrape {url}: {str(e)}"
                        errors.append(error_msg)
                        self.logger.error(error_msg)
                
                # Scrape RIV database for specific vehicle eligibility
                try:
                    riv_data = await self._scrape_riv_database(browser)
                    all_requirements.extend(riv_data)
                except Exception as e:
                    errors.append(f"RIV database scraping failed: {str(e)}")
                
                await browser.close()
                
        except Exception as e:
            error_msg = f"Browser initialization failed: {str(e)}"
            errors.append(error_msg)
            self.logger.error(error_msg)
        
        execution_time = time.time() - start_time
        
        return ScrapingResult(
            success=len(all_requirements) > 0,
            data=[req.__dict__ for req in all_requirements],
            errors=errors,
            source="cbsa_enhanced",
            records_found=len(all_requirements),
            execution_time=execution_time,
            metadata={
                "sources_scraped": len(self.base_urls),
                "comprehensive_requirements": True,
                "cost_calculation_ready": True
            }
        )
    
    async def _scrape_source(self, browser: Browser, url: str) -> List[CanadianImportRequirement]:
        """Scrape import requirements from a specific source"""
        requirements = []
        
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        await page.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-CA,en;q=0.9',
        })
        
        try:
            await page.goto(url, wait_until='networkidle', timeout=30000)
            
            if 'cbsa-asfc.gc.ca' in url:
                requirements = await self._extract_cbsa_requirements(page)
            elif 'tc.gc.ca' in url:
                requirements = await self._extract_transport_canada_requirements(page)
            elif 'riv.ca' in url:
                requirements = await self._extract_riv_requirements(page)
                
        except Exception as e:
            self.logger.error(f"Failed to scrape {url}: {str(e)}")
        
        finally:
            await page.close()
        
        return requirements
    
    async def _extract_cbsa_requirements(self, page: Page) -> List[CanadianImportRequirement]:
        """Extract requirements from CBSA website"""
        requirements = []
        
        try:
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Look for duty and tax information
            duty_sections = soup.find_all(['div', 'section'], text=re.compile(r'duty|tax|rate', re.I))
            
            # Extract general duty rates
            duty_rates = self._extract_duty_rates_from_text(soup.get_text())
            
            # Look for document requirements
            doc_sections = soup.find_all(['ul', 'ol', 'div'], text=re.compile(r'document|required|must', re.I))
            required_docs = self._extract_document_requirements(doc_sections)
            
            # Look for vehicle-specific information
            vehicle_sections = soup.find_all(text=re.compile(r'vehicle|car|motor', re.I))
            
            # Create generic requirement entry for CBSA information
            if duty_rates or required_docs:
                requirement = CanadianImportRequirement(
                    make="All Makes",
                    model="All Models",
                    year_range="All Years",
                    riv_eligible=True,
                    riv_category="conditional",
                    required_documents=required_docs,
                    modification_requirements=[],
                    estimated_cost_cad=0.0,
                    duty_rate=duty_rates.get('general', '6.1%'),
                    gst_rate="5%",
                    inspection_requirements=["Safety inspection", "Emissions test"],
                    timeline_days=30,
                    provincial_requirements={},
                    recall_clearance_required=True,
                    emissions_compliance="Transport Canada standards",
                    safety_standards=["CMVSS"],
                    notes="General CBSA import requirements",
                    source_url=page.url,
                    last_updated=datetime.now().isoformat()
                )
                requirements.append(requirement)
                
        except Exception as e:
            self.logger.error(f"Failed to extract CBSA requirements: {str(e)}")
        
        return requirements
    
    async def _extract_transport_canada_requirements(self, page: Page) -> List[CanadianImportRequirement]:
        """Extract requirements from Transport Canada website"""
        requirements = []
        
        try:
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Look for vehicle modification requirements
            mod_sections = soup.find_all(['div', 'section'], text=re.compile(r'modification|compliance|standard', re.I))
            modifications = self._extract_modification_requirements(mod_sections)
            
            # Look for safety standards
            safety_sections = soup.find_all(text=re.compile(r'safety|cmvss|standard', re.I))
            safety_standards = self._extract_safety_standards(safety_sections)
            
            # Look for emissions requirements
            emissions_sections = soup.find_all(text=re.compile(r'emission|environment|exhaust', re.I))
            emissions_info = self._extract_emissions_requirements(emissions_sections)
            
            # Create Transport Canada requirement entry
            if modifications or safety_standards:
                requirement = CanadianImportRequirement(
                    make="All Makes",
                    model="All Models",
                    year_range="All Years",
                    riv_eligible=True,
                    riv_category="conditional",
                    required_documents=["Form 1", "Bill of Sale", "Title"],
                    modification_requirements=modifications,
                    estimated_cost_cad=2500.0,
                    duty_rate="6.1%",
                    gst_rate="5%",
                    inspection_requirements=["RIV Inspection"],
                    timeline_days=45,
                    provincial_requirements={},
                    recall_clearance_required=True,
                    emissions_compliance=emissions_info,
                    safety_standards=safety_standards,
                    notes="Transport Canada compliance requirements",
                    source_url=page.url,
                    last_updated=datetime.now().isoformat()
                )
                requirements.append(requirement)
                
        except Exception as e:
            self.logger.error(f"Failed to extract Transport Canada requirements: {str(e)}")
        
        return requirements
    
    async def _extract_riv_requirements(self, page: Page) -> List[CanadianImportRequirement]:
        """Extract requirements from RIV website"""
        requirements = []
        
        try:
            # Navigate to vehicle lookup section
            lookup_link = await page.query_selector('a[href*="lookup"], a[href*="search"], a:text("Vehicle Lookup")')
            
            if lookup_link:
                await lookup_link.click()
                await page.wait_for_load_state('networkidle')
                
                # Try to search for target vehicle makes
                for make in self.target_makes[:5]:  # Limit to prevent overwhelming
                    try:
                        await self._search_riv_make(page, make, requirements)
                        await asyncio.sleep(2)
                    except Exception as e:
                        self.logger.warning(f"Failed to search RIV for {make}: {str(e)}")
                        
        except Exception as e:
            self.logger.error(f"Failed to extract RIV requirements: {str(e)}")
        
        return requirements
    
    async def _search_riv_make(self, page: Page, make: str, requirements: List[CanadianImportRequirement]):
        """Search RIV database for specific make"""
        try:
            # Look for search form
            make_input = await page.query_selector('input[name*="make"], select[name*="make"], #make')
            
            if make_input:
                await make_input.fill(make)
                
                # Submit search
                search_button = await page.query_selector('button[type="submit"], input[type="submit"], button:text("Search")')
                if search_button:
                    await search_button.click()
                    await page.wait_for_load_state('networkidle')
                    
                    # Extract results
                    await self._extract_riv_search_results(page, make, requirements)
                    
        except Exception as e:
            self.logger.warning(f"RIV search failed for {make}: {str(e)}")
    
    async def _extract_riv_search_results(self, page: Page, make: str, requirements: List[CanadianImportRequirement]):
        """Extract RIV search results"""
        try:
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Look for result tables or lists
            result_tables = soup.find_all('table')
            result_lists = soup.find_all(['ul', 'ol'])
            
            for table in result_tables:
                rows = table.find_all('tr')
                for row in rows[1:]:  # Skip header
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 3:
                        model = cells[1].get_text(strip=True) if len(cells) > 1 else ""
                        year_range = cells[2].get_text(strip=True) if len(cells) > 2 else ""
                        status = cells[3].get_text(strip=True) if len(cells) > 3 else ""
                        
                        if model and self._is_target_vehicle(make, model):
                            requirement = self._create_riv_requirement(make, model, year_range, status, page.url)
                            requirements.append(requirement)
                            
        except Exception as e:
            self.logger.warning(f"Failed to extract RIV results: {str(e)}")
    
    async def _scrape_riv_database(self, browser: Browser) -> List[CanadianImportRequirement]:
        """Scrape RIV database for comprehensive vehicle eligibility"""
        requirements = []
        
        page = await browser.new_page()
        
        try:
            await page.goto("https://www.riv.ca/ImportVehicle.aspx", wait_until='networkidle')
            
            # Look for admissible vehicle lists
            admissible_link = await page.query_selector('a[href*="admissible"], a:text("Admissible")')
            
            if admissible_link:
                await admissible_link.click()
                await page.wait_for_load_state('networkidle')
                
                # Extract admissible vehicles
                await self._extract_admissible_vehicles(page, requirements)
                
        except Exception as e:
            self.logger.error(f"Failed to scrape RIV database: {str(e)}")
        
        finally:
            await page.close()
        
        return requirements
    
    async def _extract_admissible_vehicles(self, page: Page, requirements: List[CanadianImportRequirement]):
        """Extract list of RIV admissible vehicles"""
        try:
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Look for vehicle tables or lists
            vehicle_tables = soup.find_all('table')
            
            for table in vehicle_tables:
                rows = table.find_all('tr')
                
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    
                    if len(cells) >= 3:
                        # Extract vehicle information
                        make_cell = cells[0].get_text(strip=True)
                        model_cell = cells[1].get_text(strip=True)
                        year_cell = cells[2].get_text(strip=True)
                        
                        # Check if this is a target vehicle
                        if make_cell in self.target_makes:
                            requirement = CanadianImportRequirement(
                                make=make_cell,
                                model=model_cell,
                                year_range=year_cell,
                                riv_eligible=True,
                                riv_category="admissible",
                                required_documents=["Form 1", "Bill of Sale", "Title", "Recall Clearance"],
                                modification_requirements=["DRL", "Speedometer conversion"],
                                estimated_cost_cad=1500.0,
                                duty_rate="6.1%",
                                gst_rate="5%",
                                inspection_requirements=["RIV Inspection"],
                                timeline_days=30,
                                provincial_requirements={
                                    "Ontario": ["Safety Certificate", "Drive Clean Test"],
                                    "British Columbia": ["AirCare Test", "Safety Inspection"],
                                    "Quebec": ["SAAQ Inspection"]
                                },
                                recall_clearance_required=True,
                                emissions_compliance="Transport Canada approved",
                                safety_standards=["CMVSS 108", "CMVSS 101"],
                                notes="RIV admissible vehicle",
                                source_url=page.url,
                                last_updated=datetime.now().isoformat()
                            )
                            requirements.append(requirement)
                            
        except Exception as e:
            self.logger.error(f"Failed to extract admissible vehicles: {str(e)}")
    
    def _extract_duty_rates_from_text(self, text: str) -> Dict[str, str]:
        """Extract duty rates from text content"""
        rates = {}
        
        # Look for percentage rates
        rate_patterns = [
            r'duty.*?(\d+(?:\.\d+)?)\s*%',
            r'(\d+(?:\.\d+)?)\s*%.*?duty',
            r'rate.*?(\d+(?:\.\d+)?)\s*%'
        ]
        
        for pattern in rate_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                rates['general'] = f"{matches[0]}%"
                break
        
        # Look for GST/HST
        gst_pattern = r'gst|hst.*?(\d+(?:\.\d+)?)\s*%'
        gst_matches = re.findall(gst_pattern, text, re.IGNORECASE)
        if gst_matches:
            rates['gst'] = f"{gst_matches[0]}%"
        
        return rates
    
    def _extract_document_requirements(self, sections: List) -> List[str]:
        """Extract required documents from page sections"""
        documents = []
        
        doc_keywords = [
            'bill of sale', 'title', 'registration', 'form 1', 'form 2',
            'recall clearance', 'letter', 'certificate', 'invoice',
            'customs declaration', 'import permit'
        ]
        
        for section in sections:
            text = section.get_text().lower() if hasattr(section, 'get_text') else str(section).lower()
            
            for keyword in doc_keywords:
                if keyword in text and keyword.title() not in documents:
                    documents.append(keyword.title())
        
        return documents
    
    def _extract_modification_requirements(self, sections: List) -> List[str]:
        """Extract vehicle modification requirements"""
        modifications = []
        
        mod_keywords = [
            'daytime running lights', 'drl', 'speedometer', 'odometer',
            'child tether anchors', 'immobilizer', 'door locks',
            'seat belts', 'airbag', 'bumper', 'lighting'
        ]
        
        for section in sections:
            text = section.get_text().lower() if hasattr(section, 'get_text') else str(section).lower()
            
            for keyword in mod_keywords:
                if keyword in text and keyword.title() not in modifications:
                    modifications.append(keyword.title())
        
        return modifications
    
    def _extract_safety_standards(self, sections: List) -> List[str]:
        """Extract safety standard requirements"""
        standards = []
        
        standard_patterns = [
            r'cmvss\s*(\d+)',
            r'fmvss\s*(\d+)',
            r'canada motor vehicle safety standard\s*(\d+)'
        ]
        
        text_content = ' '.join([str(section) for section in sections])
        
        for pattern in standard_patterns:
            matches = re.findall(pattern, text_content, re.IGNORECASE)
            for match in matches:
                standard = f"CMVSS {match}"
                if standard not in standards:
                    standards.append(standard)
        
        return standards
    
    def _extract_emissions_requirements(self, sections: List) -> str:
        """Extract emissions compliance information"""
        text_content = ' '.join([str(section) for section in sections])
        
        if 'epa' in text_content.lower():
            return "EPA compliant"
        elif 'environment canada' in text_content.lower():
            return "Environment Canada approved"
        elif 'carb' in text_content.lower():
            return "CARB compliant"
        else:
            return "Transport Canada standards"
    
    def _is_target_vehicle(self, make: str, model: str) -> bool:
        """Check if vehicle matches target criteria"""
        return make in self.target_makes
    
    def _create_riv_requirement(self, make: str, model: str, year_range: str, status: str, source_url: str) -> CanadianImportRequirement:
        """Create RIV requirement object"""
        riv_eligible = 'admissible' in status.lower() or 'eligible' in status.lower()
        riv_category = 'admissible' if riv_eligible else 'inadmissible'
        
        if 'conditional' in status.lower():
            riv_category = 'conditional'
        
        return CanadianImportRequirement(
            make=make,
            model=model,
            year_range=year_range,
            riv_eligible=riv_eligible,
            riv_category=riv_category,
            required_documents=["Form 1", "Bill of Sale", "Title"],
            modification_requirements=["DRL", "Speedometer"] if riv_eligible else ["Extensive modifications required"],
            estimated_cost_cad=1500.0 if riv_eligible else 5000.0,
            duty_rate="6.1%",
            gst_rate="5%",
            inspection_requirements=["RIV Inspection"],
            timeline_days=30 if riv_eligible else 90,
            provincial_requirements={},
            recall_clearance_required=True,
            emissions_compliance="Transport Canada standards",
            safety_standards=["CMVSS"],
            notes=f"RIV status: {status}",
            source_url=source_url,
            last_updated=datetime.now().isoformat()
        )
    
    def validate_data(self, data: Dict[str, Any]) -> bool:
        """Validate extracted Canadian import data"""
        required_fields = ['make', 'riv_eligible', 'duty_rate']
        
        for field in required_fields:
            if field not in data or data[field] is None:
                return False
        
        return True
    
    def clean_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and normalize Canadian import data"""
        cleaned = data.copy()
        
        # Normalize make/model
        if 'make' in cleaned:
            cleaned['make'] = cleaned['make'].title().strip()
        
        if 'model' in cleaned:
            cleaned['model'] = cleaned['model'].title().strip()
        
        # Clean duty rate
        if 'duty_rate' in cleaned:
            cleaned['duty_rate'] = self._normalize_rate(cleaned['duty_rate'])
        
        if 'gst_rate' in cleaned:
            cleaned['gst_rate'] = self._normalize_rate(cleaned['gst_rate'])
        
        # Ensure lists are properly formatted
        list_fields = ['required_documents', 'modification_requirements', 'safety_standards']
        for field in list_fields:
            if field in cleaned and not isinstance(cleaned[field], list):
                cleaned[field] = []
        
        return cleaned
    
    def _normalize_rate(self, rate: str) -> str:
        """Normalize duty/tax rate format"""
        if not rate:
            return "0%"
        
        # Extract percentage
        percentage_match = re.search(r'(\d+(?:\.\d+)?)', str(rate))
        if percentage_match:
            return f"{percentage_match.group(1)}%"
        
        return str(rate)