"""
Vehicle Import Eligibility Scraper
Scrapes government regulatory databases for import eligibility data
Focuses on NHTSA, EPA, DOT, and international regulatory sources
"""

import re
from bs4 import BeautifulSoup
from typing import Dict, List, Any
from .base_scraper import BaseScraper, ScrapingResult
import time
from datetime import datetime, timedelta
import json

class VehicleImportEligibilityScraper(BaseScraper):
    """Scraper for vehicle import eligibility from government sources"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.regulatory_sources = config.get('regulatory_sources', {
            'nhtsa': {
                'base_url': 'https://www.nhtsa.gov',
                'eligible_vehicles_path': '/vehicle-importers/import-nonconforming-vehicle',
                'exemption_list_path': '/vehicle-manufacturers/oem-information'
            },
            'epa': {
                'base_url': 'https://www.epa.gov',
                'emissions_path': '/vehicle-and-fuel-emissions-standards/importing-vehicles-and-engines',
                'compliance_path': '/otaq/imports'
            },
            'dot': {
                'base_url': 'https://www.transportation.gov',
                'safety_standards_path': '/safety/vehicle-safety/import-requirements'
            },
            'canada_riv': {
                'base_url': 'https://www.tc.gc.ca',
                'admissible_vehicles_path': '/eng/motorvehiclesafety/importation-vehicles/list-admissible-vehicles'
            },
            'uk_dvla': {
                'base_url': 'https://www.gov.uk',
                'import_rules_path': '/importing-vehicles-into-the-uk',
                'type_approval_path': '/vehicle-type-approval'
            },
            'australia_raws': {
                'base_url': 'https://www.infrastructure.gov.au',
                'import_scheme_path': '/vehicles/vehicle-standards/importing-vehicles'
            }
        })
        
        # Popular import vehicles to focus on
        self.target_vehicles = config.get('target_vehicles', [
            {'make': 'Nissan', 'model': 'Skyline GT-R', 'variants': ['R32', 'R33', 'R34']},
            {'make': 'Toyota', 'model': 'Supra', 'variants': ['A70', 'A80', 'A90']},
            {'make': 'Honda', 'model': 'Civic Type R', 'variants': ['EK9', 'EP3', 'FD2', 'FK2', 'FK8']},
            {'make': 'Subaru', 'model': 'Impreza WRX STI', 'variants': ['GC8', 'GDB', 'GRB']},
            {'make': 'Mitsubishi', 'model': 'Lancer Evolution', 'variants': ['IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']},
            {'make': 'BMW', 'model': 'M3', 'variants': ['E30', 'E36', 'E46', 'E90', 'E92']},
            {'make': 'Mercedes-Benz', 'model': 'AMG', 'variants': ['C63', 'E63', 'S63']},
            {'make': 'Audi', 'model': 'RS', 'variants': ['RS4', 'RS6', 'RS7']},
            {'make': 'Volkswagen', 'model': 'Golf R', 'variants': ['Mk5', 'Mk6', 'Mk7', 'Mk8']},
            {'make': 'Porsche', 'model': '911', 'variants': ['964', '993', '996', '997']}
        ])
    
    def scrape(self) -> ScrapingResult:
        """Main scraping method for import eligibility data"""
        start_time = time.time()
        all_data = []
        errors = []
        
        for source_name, source_config in self.regulatory_sources.items():
            try:
                self.logger.info(f"Scraping {source_name} import eligibility data...")
                data = self._scrape_regulatory_source(source_name, source_config)
                all_data.extend(data)
                self.logger.info(f"Found {len(data)} eligibility records from {source_name}")
            except Exception as e:
                error_msg = f"Error scraping {source_name}: {str(e)}"
                self.logger.error(error_msg)
                errors.append(error_msg)
        
        execution_time = time.time() - start_time
        
        return ScrapingResult(
            success=len(errors) == 0,
            data=all_data,
            errors=errors,
            source="import_eligibility",
            records_found=len(all_data),
            execution_time=execution_time,
            metadata={
                'sources_scraped': list(self.regulatory_sources.keys()),
                'target_vehicles_checked': len(self.target_vehicles),
                'timestamp': datetime.now().isoformat()
            }
        )
    
    def _scrape_regulatory_source(self, source_name: str, source_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scrape a specific regulatory source"""
        base_url = source_config['base_url']
        eligibility_data = []
        
        # Scrape different paths for this source
        for path_name, path_url in source_config.items():
            if path_name == 'base_url':
                continue
                
            try:
                full_url = f"{base_url}{path_url}"
                response = self.make_request(full_url)
                if response:
                    data = self.parse_data(response.text, full_url)
                    # Tag data with source and path information
                    for item in data:
                        item['regulatory_source'] = source_name
                        item['source_path'] = path_name
                    eligibility_data.extend(data)
            except Exception as e:
                self.logger.warning(f"Error scraping {source_name} {path_name}: {str(e)}")
                continue
        
        return eligibility_data
    
    def parse_data(self, html_content: str, url: str) -> List[Dict[str, Any]]:
        """Parse HTML content to extract import eligibility data"""
        soup = BeautifulSoup(html_content, 'html.parser')
        eligibility_records = []
        
        # NHTSA parsing
        if 'nhtsa.gov' in url:
            eligibility_records.extend(self._parse_nhtsa_data(soup, url))
        
        # EPA parsing
        elif 'epa.gov' in url:
            eligibility_records.extend(self._parse_epa_data(soup, url))
        
        # DOT parsing
        elif 'transportation.gov' in url:
            eligibility_records.extend(self._parse_dot_data(soup, url))
        
        # Canada RIV parsing
        elif 'tc.gc.ca' in url:
            eligibility_records.extend(self._parse_canada_riv_data(soup, url))
        
        # UK DVLA parsing
        elif 'gov.uk' in url:
            eligibility_records.extend(self._parse_uk_dvla_data(soup, url))
        
        # Australia RAWS parsing
        elif 'infrastructure.gov.au' in url:
            eligibility_records.extend(self._parse_australia_raws_data(soup, url))
        
        return eligibility_records
    
    def _parse_nhtsa_data(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Parse NHTSA import eligibility data"""
        records = []
        
        # Look for vehicle eligibility information
        # NHTSA often has tables or lists of eligible/exempt vehicles
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')[1:]  # Skip header
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 3:
                    try:
                        # Extract vehicle information from table
                        vehicle_info = cells[0].get_text(strip=True)
                        year_match = re.search(r'\b(19|20)\d{2}\b', vehicle_info)
                        year = int(year_match.group()) if year_match else None
                        
                        make = self._extract_make_from_text(vehicle_info)
                        model = self._extract_model_from_text(vehicle_info)
                        
                        # Check if this is a target vehicle
                        if self._is_target_vehicle(make, model):
                            eligibility_status = cells[1].get_text(strip=True) if len(cells) > 1 else 'Unknown'
                            requirements = cells[2].get_text(strip=True) if len(cells) > 2 else ''
                            
                            # Calculate 25-year eligibility
                            current_year = datetime.now().year
                            twenty_five_year_eligible = year and (current_year - year >= 25)
                            
                            record = {
                                'make': make,
                                'model': model,
                                'year': year,
                                'country_destination': 'United States',
                                'eligibility_status': eligibility_status,
                                'twenty_five_year_rule': twenty_five_year_eligible,
                                'requirements': requirements,
                                'regulatory_authority': 'NHTSA',
                                'source_url': url,
                                'last_updated': datetime.now().isoformat(),
                                'notes': f"25-year rule: {'Eligible' if twenty_five_year_eligible else 'Not eligible'}"
                            }
                            
                            if self.validate_data(record):
                                records.append(self.clean_data(record))
                    
                    except Exception as e:
                        self.logger.warning(f"Error parsing NHTSA table row: {str(e)}")
                        continue
        
        # Look for specific mentions of popular import vehicles
        text_content = soup.get_text()
        for target_vehicle in self.target_vehicles:
            make = target_vehicle['make']
            model = target_vehicle['model']
            
            # Search for mentions of this vehicle
            pattern = rf'\b{make}.*{model}\b'
            matches = re.finditer(pattern, text_content, re.IGNORECASE)
            
            for match in matches:
                # Extract surrounding context
                start = max(0, match.start() - 200)
                end = min(len(text_content), match.end() + 200)
                context = text_content[start:end]
                
                # Look for eligibility keywords
                eligibility = 'Unknown'
                if re.search(r'eligible|approved|permitted', context, re.I):
                    eligibility = 'Eligible'
                elif re.search(r'prohibited|banned|not eligible', context, re.I):
                    eligibility = 'Not Eligible'
                
                record = {
                    'make': make,
                    'model': model,
                    'country_destination': 'United States',
                    'eligibility_status': eligibility,
                    'regulatory_authority': 'NHTSA',
                    'source_url': url,
                    'context': context[:500],  # First 500 chars of context
                    'last_updated': datetime.now().isoformat()
                }
                
                if self.validate_data(record):
                    records.append(self.clean_data(record))
        
        return records
    
    def _parse_epa_data(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Parse EPA emissions compliance data"""
        records = []
        
        # Look for emissions compliance information
        text_content = soup.get_text()
        
        # Search for vehicle-specific emissions requirements
        for target_vehicle in self.target_vehicles:
            make = target_vehicle['make']
            model = target_vehicle['model']
            
            # Look for emissions compliance mentions
            pattern = rf'\b{make}.*{model}\b'
            matches = re.finditer(pattern, text_content, re.IGNORECASE)
            
            for match in matches:
                start = max(0, match.start() - 300)
                end = min(len(text_content), match.end() + 300)
                context = text_content[start:end]
                
                # Extract emissions compliance status
                compliance_status = 'Unknown'
                if re.search(r'compliant|meets standards|certified', context, re.I):
                    compliance_status = 'EPA Compliant'
                elif re.search(r'non-compliant|does not meet|modification required', context, re.I):
                    compliance_status = 'Requires Modification'
                
                record = {
                    'make': make,
                    'model': model,
                    'country_destination': 'United States',
                    'emissions_compliance': compliance_status,
                    'regulatory_authority': 'EPA',
                    'source_url': url,
                    'compliance_notes': context[:300],
                    'last_updated': datetime.now().isoformat()
                }
                
                if self.validate_data(record):
                    records.append(self.clean_data(record))
        
        return records
    
    def _parse_canada_riv_data(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Parse Canadian RIV admissible vehicles data"""
        records = []
        
        # Look for admissible vehicle lists
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    vehicle_text = ' '.join([cell.get_text(strip=True) for cell in cells])
                    
                    # Check if this contains target vehicle information
                    for target_vehicle in self.target_vehicles:
                        make = target_vehicle['make']
                        model = target_vehicle['model']
                        
                        if re.search(rf'\b{make}\b.*\b{model}\b', vehicle_text, re.I):
                            year_match = re.search(r'\b(19|20)\d{2}\b', vehicle_text)
                            year = int(year_match.group()) if year_match else None
                            
                            record = {
                                'make': make,
                                'model': model,
                                'year': year,
                                'country_destination': 'Canada',
                                'eligibility_status': 'RIV Admissible',
                                'regulatory_authority': 'Transport Canada',
                                'source_url': url,
                                'vehicle_details': vehicle_text[:200],
                                'last_updated': datetime.now().isoformat()
                            }
                            
                            if self.validate_data(record):
                                records.append(self.clean_data(record))
        
        return records
    
    def _parse_uk_dvla_data(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Parse UK DVLA import requirements"""
        records = []
        
        # Extract import requirements and type approval information
        text_content = soup.get_text()
        
        # Look for age-based import rules
        age_rules = re.findall(r'(\d+)\s*years?\s*old.*import', text_content, re.I)
        
        for target_vehicle in self.target_vehicles:
            make = target_vehicle['make']
            model = target_vehicle['model']
            
            record = {
                'make': make,
                'model': model,
                'country_destination': 'United Kingdom',
                'regulatory_authority': 'DVLA',
                'source_url': url,
                'age_requirements': age_rules,
                'type_approval_required': 'Individual Vehicle Approval' in text_content,
                'last_updated': datetime.now().isoformat()
            }
            
            if self.validate_data(record):
                records.append(self.clean_data(record))
        
        return records
    
    def _parse_australia_raws_data(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Parse Australian RAWS import scheme data"""
        records = []
        
        # Look for RAWS eligible vehicles and requirements
        text_content = soup.get_text()
        
        for target_vehicle in self.target_vehicles:
            make = target_vehicle['make']
            model = target_vehicle['model']
            
            # Check for RAWS eligibility
            pattern = rf'\b{make}.*{model}\b'
            if re.search(pattern, text_content, re.I):
                eligibility = 'RAWS Eligible' if 'eligible' in text_content.lower() else 'Requires Assessment'
                
                record = {
                    'make': make,
                    'model': model,
                    'country_destination': 'Australia',
                    'eligibility_status': eligibility,
                    'regulatory_authority': 'Australian Government',
                    'import_scheme': 'RAWS',
                    'source_url': url,
                    'last_updated': datetime.now().isoformat()
                }
                
                if self.validate_data(record):
                    records.append(self.clean_data(record))
        
        return records
    
    def _parse_dot_data(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Parse DOT safety standards data"""
        records = []
        
        # Extract safety compliance requirements
        text_content = soup.get_text()
        
        # Look for FMVSS compliance information
        fmvss_mentions = re.findall(r'FMVSS\s*\d+', text_content)
        
        for target_vehicle in self.target_vehicles:
            make = target_vehicle['make']
            model = target_vehicle['model']
            
            record = {
                'make': make,
                'model': model,
                'country_destination': 'United States',
                'regulatory_authority': 'DOT',
                'safety_standards': fmvss_mentions,
                'source_url': url,
                'last_updated': datetime.now().isoformat()
            }
            
            if self.validate_data(record):
                records.append(self.clean_data(record))
        
        return records
    
    def _extract_make_from_text(self, text: str) -> str:
        """Extract vehicle make from text"""
        makes = ['Toyota', 'Honda', 'Nissan', 'Subaru', 'Mitsubishi', 'BMW', 'Mercedes-Benz', 
                'Audi', 'Volkswagen', 'Porsche', 'Ferrari', 'Lamborghini', 'McLaren']
        
        for make in makes:
            if re.search(rf'\b{make}\b', text, re.I):
                return make
        
        return 'Unknown'
    
    def _extract_model_from_text(self, text: str) -> str:
        """Extract vehicle model from text"""
        models = ['Skyline', 'GT-R', 'Supra', 'Civic', 'Type R', 'WRX', 'STI', 'Evolution', 
                 'M3', 'M5', 'AMG', 'RS4', 'RS6', 'Golf', '911', 'Impreza', 'Lancer']
        
        for model in models:
            if re.search(rf'\b{model}\b', text, re.I):
                return model
        
        return 'Unknown'
    
    def _is_target_vehicle(self, make: str, model: str) -> bool:
        """Check if vehicle is in our target list"""
        for target in self.target_vehicles:
            if (make.lower() == target['make'].lower() and 
                any(variant.lower() in model.lower() for variant in [target['model']] + target.get('variants', []))):
                return True
        return False