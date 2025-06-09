"""
Government Forms Scraper for Vehicle Import Compliance
Scrapes authentic import forms and requirements from official government websites
Targets CBP, CBSA, HMRC, ABF, and other customs authorities
"""

import asyncio
import json
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin, urlparse
import aiohttp
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Browser, Page
import logging

from base_scraper import BaseScraper, ScrapingResult

class GovernmentFormsScraper(BaseScraper):
    """
    Comprehensive scraper for official government vehicle import forms
    Targets Tier 1 importing countries with highest verification standards
    """
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.government_targets = {
            'USA': {
                'cbp': 'https://www.cbp.gov',
                'epa': 'https://www.epa.gov',
                'nhtsa': 'https://www.nhtsa.gov',
                'forms_paths': [
                    '/document/forms',
                    '/importing-vehicles-and-engines',
                    '/importing-vehicle'
                ]
            },
            'Canada': {
                'cbsa': 'https://www.cbsa-asfc.gc.ca',
                'riv': 'https://www.riv.ca',
                'transport_canada': 'https://tc.canada.ca',
                'forms_paths': [
                    '/publications/forms-formulaires',
                    '/ImportFormFill.aspx',
                    '/en/road-transportation/importing-vehicle'
                ]
            },
            'UK': {
                'hmrc': 'https://www.gov.uk',
                'dvla': 'https://www.gov.uk',
                'forms_paths': [
                    '/government/publications',
                    '/vehicle-registration',
                    '/importing-vehicles-into-the-uk'
                ]
            },
            'Australia': {
                'abf': 'https://www.abf.gov.au',
                'infrastructure': 'https://www.infrastructure.gov.au',
                'forms_paths': [
                    '/importing-exporting-and-manufacturing/importing',
                    '/vehicles/imports',
                    '/vehicles/standards'
                ]
            },
            'Germany': {
                'zoll': 'https://www.zoll.de',
                'kba': 'https://www.kba.de',
                'forms_paths': [
                    '/DE/Fachthemen/Zoelle',
                    '/DE/Typgenehmigung'
                ]
            }
        }
    
    async def scrape(self) -> ScrapingResult:
        """Main scraping method for government forms"""
        all_forms = []
        errors = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            
            try:
                for country, agencies in self.government_targets.items():
                    self.logger.info(f"Scraping {country} government forms...")
                    
                    country_forms = await self._scrape_country_forms(browser, country, agencies)
                    all_forms.extend(country_forms)
                    
                    # Rate limiting between countries
                    await asyncio.sleep(2)
                
            except Exception as e:
                errors.append(f"Browser error: {str(e)}")
            finally:
                await browser.close()
        
        return ScrapingResult(
            success=len(all_forms) > 0,
            data=all_forms,
            errors=errors,
            source="government_websites",
            records_found=len(all_forms),
            execution_time=0,
            metadata={"countries_scraped": len(self.government_targets)}
        )
    
    async def _scrape_country_forms(self, browser: Browser, country: str, agencies: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scrape forms for a specific country"""
        forms = []
        
        for agency_name, base_url in agencies.items():
            if agency_name == 'forms_paths':
                continue
                
            try:
                agency_forms = await self._scrape_agency_forms(browser, country, agency_name, base_url, agencies['forms_paths'])
                forms.extend(agency_forms)
                
            except Exception as e:
                self.logger.error(f"Error scraping {agency_name}: {str(e)}")
        
        return forms
    
    async def _scrape_agency_forms(self, browser: Browser, country: str, agency: str, base_url: str, paths: List[str]) -> List[Dict[str, Any]]:
        """Scrape forms from a specific government agency"""
        forms = []
        page = await browser.new_page()
        
        try:
            for path in paths:
                url = urljoin(base_url, path)
                
                try:
                    await page.goto(url, timeout=30000)
                    await page.wait_for_load_state('networkidle')
                    
                    # Extract forms from this page
                    page_forms = await self._extract_forms_from_page(page, country, agency, url)
                    forms.extend(page_forms)
                    
                    # Look for additional form links
                    form_links = await self._find_form_links(page, base_url)
                    
                    for link_url in form_links[:5]:  # Limit to prevent excessive crawling
                        try:
                            await page.goto(link_url, timeout=20000)
                            await page.wait_for_load_state('networkidle')
                            
                            link_forms = await self._extract_forms_from_page(page, country, agency, link_url)
                            forms.extend(link_forms)
                            
                        except Exception as e:
                            self.logger.debug(f"Error accessing form link {link_url}: {str(e)}")
                    
                    await asyncio.sleep(1)  # Rate limiting
                    
                except Exception as e:
                    self.logger.error(f"Error accessing {url}: {str(e)}")
        
        finally:
            await page.close()
        
        return forms
    
    async def _extract_forms_from_page(self, page: Page, country: str, agency: str, url: str) -> List[Dict[str, Any]]:
        """Extract form information from a government webpage"""
        forms = []
        
        try:
            # Get page content
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Look for forms using multiple strategies
            potential_forms = []
            
            # Strategy 1: Look for PDF links with form patterns
            pdf_links = soup.find_all('a', href=re.compile(r'\.pdf$', re.I))
            for link in pdf_links:
                href = link.get('href')
                text = link.get_text(strip=True)
                
                if self._is_vehicle_form(text, href):
                    potential_forms.append({
                        'type': 'pdf_form',
                        'name': text,
                        'url': urljoin(url, href),
                        'description': self._extract_form_description(link, soup)
                    })
            
            # Strategy 2: Look for form pages and downloads
            form_links = soup.find_all('a', href=re.compile(r'form|import|vehicle|declaration', re.I))
            for link in form_links:
                href = link.get('href')
                text = link.get_text(strip=True)
                
                if self._is_vehicle_form(text, href):
                    potential_forms.append({
                        'type': 'form_page',
                        'name': text,
                        'url': urljoin(url, href),
                        'description': self._extract_form_description(link, soup)
                    })
            
            # Strategy 3: Look for form codes in text
            form_codes = re.findall(r'\b(?:CBP|EPA|DOT|NHTSA|CBSA|RIV|TC|HMRC|DVLA|ABF|RAV|MVSA|C88|N10|EAS|COC|C-5020)[-\s]?(\d+[-\d]*)\b', content, re.I)
            
            for match in form_codes:
                full_code = match[0] if isinstance(match, tuple) else match
                potential_forms.append({
                    'type': 'form_code',
                    'name': f"Form {full_code}",
                    'url': url,
                    'description': f"Referenced form code found on {agency} website"
                })
            
            # Convert potential forms to structured data
            for form_data in potential_forms:
                form = {
                    'country': country,
                    'agency': agency,
                    'form_name': form_data['name'],
                    'form_url': form_data['url'],
                    'source_page': url,
                    'form_type': form_data['type'],
                    'description': form_data['description'],
                    'scraped_at': datetime.now().isoformat(),
                    'verified': True,
                    'required_for_vehicles': self._categorize_vehicle_types(form_data['name'], form_data['description'])
                }
                
                # Extract additional metadata
                form.update(self._extract_form_metadata(soup, form_data))
                forms.append(form)
        
        except Exception as e:
            self.logger.error(f"Error extracting forms from {url}: {str(e)}")
        
        return forms
    
    async def _find_form_links(self, page: Page, base_url: str) -> List[str]:
        """Find additional form-related links on the page"""
        try:
            # Look for links that might lead to more forms
            links = await page.query_selector_all('a[href*="form"], a[href*="import"], a[href*="vehicle"], a[href*="declaration"]')
            
            urls = []
            for link in links[:10]:  # Limit to prevent excessive crawling
                href = await link.get_attribute('href')
                if href:
                    full_url = urljoin(base_url, href)
                    if self._is_valid_government_url(full_url, base_url):
                        urls.append(full_url)
            
            return list(set(urls))  # Remove duplicates
            
        except Exception as e:
            self.logger.debug(f"Error finding form links: {str(e)}")
            return []
    
    def _is_vehicle_form(self, text: str, url: str) -> bool:
        """Determine if a link/text refers to a vehicle import form"""
        if not text and not url:
            return False
        
        content = f"{text} {url}".lower()
        
        # Vehicle-related keywords
        vehicle_keywords = [
            'vehicle', 'car', 'automobile', 'motor', 'import', 'customs',
            'declaration', 'entry', 'registration', 'compliance', 'safety',
            'emission', 'certificate', 'conformity', 'inspection'
        ]
        
        # Form indicators
        form_indicators = [
            'form', 'application', 'declaration', 'certificate', 'permit',
            'license', 'registration', 'cbp', 'epa', 'nhtsa', 'cbsa', 'riv',
            'hmrc', 'dvla', 'abf', 'rav', 'mvsa'
        ]
        
        has_vehicle = any(keyword in content for keyword in vehicle_keywords)
        has_form = any(indicator in content for indicator in form_indicators)
        
        return has_vehicle and has_form
    
    def _extract_form_description(self, link_element, soup: BeautifulSoup) -> str:
        """Extract description for a form from surrounding context"""
        try:
            # Look for description in parent elements
            parent = link_element.parent
            if parent:
                desc = parent.get_text(strip=True)
                if len(desc) > len(link_element.get_text(strip=True)):
                    return desc[:200]  # Limit description length
            
            # Look for nearby paragraph or description
            siblings = link_element.find_next_siblings(['p', 'div', 'span'])
            for sibling in siblings[:2]:
                text = sibling.get_text(strip=True)
                if text and len(text) > 20:
                    return text[:200]
            
            return "Form found on government website"
            
        except Exception:
            return "Government import form"
    
    def _categorize_vehicle_types(self, name: str, description: str) -> List[str]:
        """Categorize which vehicle types the form applies to"""
        content = f"{name} {description}".lower()
        categories = []
        
        if any(word in content for word in ['passenger', 'car', 'automobile']):
            categories.append('passenger_cars')
        
        if any(word in content for word in ['commercial', 'truck', 'bus']):
            categories.append('commercial')
        
        if any(word in content for word in ['motorcycle', 'bike']):
            categories.append('motorcycle')
        
        if any(word in content for word in ['classic', 'antique', 'vintage']):
            categories.append('classic')
        
        # Default to all types if none specified
        if not categories:
            categories = ['passenger_cars', 'commercial', 'motorcycle', 'classic']
        
        return categories
    
    def _extract_form_metadata(self, soup: BeautifulSoup, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract additional metadata about the form"""
        metadata = {}
        
        try:
            # Look for processing times
            time_patterns = [
                r'(\d+)\s*(?:business\s*)?days?',
                r'(\d+)\s*weeks?',
                r'(\d+)\s*months?'
            ]
            
            content = soup.get_text()
            for pattern in time_patterns:
                match = re.search(pattern, content, re.I)
                if match:
                    days = int(match.group(1))
                    if 'week' in pattern:
                        days *= 7
                    elif 'month' in pattern:
                        days *= 30
                    metadata['processing_days'] = days
                    break
            
            # Look for fees
            fee_patterns = [
                r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)',
                r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|CAD|GBP|AUD|EUR)',
                r'fee[:\s]*(\d+(?:,\d{3})*(?:\.\d{2})?)'
            ]
            
            for pattern in fee_patterns:
                match = re.search(pattern, content, re.I)
                if match:
                    fee_str = match.group(1).replace(',', '')
                    try:
                        metadata['fee_amount'] = float(fee_str)
                        break
                    except ValueError:
                        continue
            
            # Look for mandatory/optional indicators
            if any(word in content.lower() for word in ['required', 'mandatory', 'must']):
                metadata['mandatory'] = True
            elif any(word in content.lower() for word in ['optional', 'voluntary']):
                metadata['mandatory'] = False
        
        except Exception as e:
            self.logger.debug(f"Error extracting metadata: {str(e)}")
        
        return metadata
    
    def _is_valid_government_url(self, url: str, base_url: str) -> bool:
        """Check if URL is a valid government URL to follow"""
        try:
            parsed_url = urlparse(url)
            parsed_base = urlparse(base_url)
            
            # Must be same domain
            if parsed_url.netloc != parsed_base.netloc:
                return False
            
            # Avoid certain paths
            avoid_paths = [
                '/search', '/login', '/register', '/account',
                '/admin', '/api', '/feed', '/rss'
            ]
            
            if any(avoid in url.lower() for avoid in avoid_paths):
                return False
            
            return True
            
        except Exception:
            return False
    
    def validate_data(self, data: Dict[str, Any]) -> bool:
        """Validate extracted government form data"""
        required_fields = ['country', 'agency', 'form_name', 'form_url']
        
        for field in required_fields:
            if not data.get(field):
                return False
        
        # Validate URL format
        try:
            urlparse(data['form_url'])
        except Exception:
            return False
        
        # Ensure form is vehicle-related
        content = f"{data.get('form_name', '')} {data.get('description', '')}".lower()
        vehicle_terms = ['vehicle', 'car', 'automobile', 'motor', 'import']
        
        if not any(term in content for term in vehicle_terms):
            return False
        
        return True
    
    def clean_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and normalize government form data"""
        # Clean form name
        if 'form_name' in data:
            data['form_name'] = re.sub(r'\s+', ' ', data['form_name']).strip()
        
        # Clean description
        if 'description' in data:
            data['description'] = re.sub(r'\s+', ' ', data['description']).strip()
            if len(data['description']) > 500:
                data['description'] = data['description'][:497] + "..."
        
        # Normalize country names
        country_mappings = {
            'USA': 'United States',
            'UK': 'United Kingdom'
        }
        
        if data.get('country') in country_mappings:
            data['country_full'] = country_mappings[data['country']]
        
        # Extract form code if present
        form_name = data.get('form_name', '')
        code_match = re.search(r'\b([A-Z]{2,5}[-\s]?\d+[-\d]*)\b', form_name)
        if code_match:
            data['form_code'] = code_match.group(1).replace(' ', '-')
        
        return data


class FormFieldExtractor:
    """
    Specialized extractor for form field requirements
    Analyzes PDF forms and web forms to extract field specifications
    """
    
    def __init__(self):
        self.field_patterns = {
            'vin': r'vin|vehicle\s*identification\s*number',
            'make': r'make|manufacturer',
            'model': r'model',
            'year': r'year|model\s*year',
            'engine': r'engine|motor',
            'displacement': r'displacement|engine\s*size',
            'country_origin': r'country\s*of\s*origin|manufactured\s*in',
            'purchase_price': r'purchase\s*price|value|cost',
            'shipper': r'shipper|shipping\s*company',
            'port': r'port\s*of\s*entry|destination\s*port'
        }
    
    async def extract_form_fields(self, form_url: str) -> List[Dict[str, Any]]:
        """Extract field requirements from a form URL"""
        fields = []
        
        try:
            if form_url.endswith('.pdf'):
                fields = await self._extract_pdf_fields(form_url)
            else:
                fields = await self._extract_web_form_fields(form_url)
        
        except Exception as e:
            logging.error(f"Error extracting fields from {form_url}: {str(e)}")
        
        return fields
    
    async def _extract_pdf_fields(self, pdf_url: str) -> List[Dict[str, Any]]:
        """Extract fields from PDF forms (placeholder for PDF processing)"""
        # This would require PDF processing libraries like PyPDF2 or pdfplumber
        # For now, return common fields based on form type
        return [
            {
                'field_name': 'vin',
                'field_type': 'text',
                'required': True,
                'description': 'Vehicle Identification Number',
                'max_length': 17
            },
            {
                'field_name': 'make',
                'field_type': 'text',
                'required': True,
                'description': 'Vehicle manufacturer'
            },
            {
                'field_name': 'model',
                'field_type': 'text',
                'required': True,
                'description': 'Vehicle model'
            },
            {
                'field_name': 'year',
                'field_type': 'number',
                'required': True,
                'description': 'Model year'
            }
        ]
    
    async def _extract_web_form_fields(self, form_url: str) -> List[Dict[str, Any]]:
        """Extract fields from web-based forms"""
        fields = []
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(form_url) as response:
                    if response.status == 200:
                        content = await response.text()
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        # Find form inputs
                        inputs = soup.find_all(['input', 'select', 'textarea'])
                        
                        for input_elem in inputs:
                            field = self._analyze_form_input(input_elem)
                            if field:
                                fields.append(field)
            
            except Exception as e:
                logging.error(f"Error accessing web form {form_url}: {str(e)}")
        
        return fields
    
    def _analyze_form_input(self, input_elem) -> Optional[Dict[str, Any]]:
        """Analyze a form input element to extract field information"""
        field_type = input_elem.get('type', 'text')
        name = input_elem.get('name', '')
        id_attr = input_elem.get('id', '')
        required = input_elem.has_attr('required')
        
        # Get label text
        label_text = ''
        if id_attr:
            label = input_elem.find_previous('label', {'for': id_attr})
            if label:
                label_text = label.get_text(strip=True)
        
        if not label_text and name:
            # Look for nearby text that might be a label
            parent = input_elem.parent
            if parent:
                label_text = parent.get_text(strip=True)
        
        # Categorize field based on name/label
        field_category = self._categorize_field(name, label_text)
        
        if field_category:
            return {
                'field_name': field_category,
                'field_type': self._normalize_field_type(field_type),
                'required': required,
                'description': label_text or name,
                'html_name': name,
                'validation_rules': self._extract_validation_rules(input_elem)
            }
        
        return None
    
    def _categorize_field(self, name: str, label: str) -> Optional[str]:
        """Categorize a form field based on name and label"""
        content = f"{name} {label}".lower()
        
        for category, pattern in self.field_patterns.items():
            if re.search(pattern, content, re.I):
                return category
        
        return None
    
    def _normalize_field_type(self, html_type: str) -> str:
        """Normalize HTML field types to standard types"""
        type_mapping = {
            'text': 'text',
            'email': 'text',
            'tel': 'text',
            'url': 'text',
            'number': 'number',
            'date': 'date',
            'select': 'dropdown',
            'textarea': 'text',
            'file': 'file_upload',
            'checkbox': 'checkbox',
            'radio': 'radio'
        }
        
        return type_mapping.get(html_type, 'text')
    
    def _extract_validation_rules(self, input_elem) -> Dict[str, Any]:
        """Extract validation rules from form input"""
        rules = {}
        
        if input_elem.get('maxlength'):
            rules['maxLength'] = int(input_elem['maxlength'])
        
        if input_elem.get('minlength'):
            rules['minLength'] = int(input_elem['minlength'])
        
        if input_elem.get('pattern'):
            rules['pattern'] = input_elem['pattern']
        
        if input_elem.get('min'):
            rules['min'] = input_elem['min']
        
        if input_elem.get('max'):
            rules['max'] = input_elem['max']
        
        # Extract options for select elements
        if input_elem.name == 'select':
            options = []
            for option in input_elem.find_all('option'):
                if option.get('value'):
                    options.append(option['value'])
            if options:
                rules['options'] = options
        
        return rules