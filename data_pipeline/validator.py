"""
Data Validation Pipeline
Validates scraped data quality for import eligibility, duty rates, and vehicle information
Ensures data integrity before loading into PostgreSQL
"""

import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass

@dataclass
class ValidationResult:
    """Result of data validation"""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    quality_score: float
    validated_data: Dict[str, Any]

class DataValidator:
    """Comprehensive data validator for import-related data"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.logger = logging.getLogger(__name__)
        
        # Validation rules
        self.required_fields = {
            'vehicle': ['make', 'model'],
            'duty_rate': ['country', 'duty_rate_percent'],
            'import_eligibility': ['country_destination', 'regulatory_authority'],
            'timeline_data': ['process_step', 'estimated_duration_days']
        }
        
        # Known valid values
        self.valid_makes = {
            'Toyota', 'Honda', 'Nissan', 'Subaru', 'Mitsubishi', 'Mazda', 'Lexus', 'Acura', 'Infiniti',
            'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche', 'Volvo', 'Jaguar', 'Land Rover',
            'Ford', 'Chevrolet', 'Dodge', 'Chrysler', 'Jeep', 'Cadillac', 'Buick', 'GMC', 'Lincoln',
            'Ferrari', 'Lamborghini', 'McLaren', 'Aston Martin', 'Bentley', 'Rolls-Royce', 'Maserati',
            'Hyundai', 'Kia', 'Genesis', 'Tesla', 'Polestar', 'Lucid', 'Rivian'
        }
        
        self.valid_countries = {
            'United States', 'Canada', 'United Kingdom', 'Australia', 'New Zealand',
            'Japan', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium',
            'European Union', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland'
        }
        
        self.regulatory_authorities = {
            'NHTSA', 'EPA', 'DOT', 'Transport Canada', 'DVLA', 'Australian Border Force',
            'Transport for NSW', 'VicRoads', 'European Commission', 'TÜV', 'MOT'
        }
    
    def validate_vehicle_data(self, data: Dict[str, Any]) -> ValidationResult:
        """Validate vehicle-related data"""
        errors = []
        warnings = []
        validated_data = data.copy()
        
        # Required field validation
        for field in self.required_fields['vehicle']:
            if field not in data or not data[field]:
                errors.append(f"Missing required field: {field}")
        
        # Make validation
        if 'make' in data:
            make = str(data['make']).strip()
            if make not in self.valid_makes:
                # Try to find close match
                close_match = self._find_closest_make(make)
                if close_match:
                    warnings.append(f"Make '{make}' corrected to '{close_match}'")
                    validated_data['make'] = close_match
                else:
                    warnings.append(f"Unknown make: {make}")
        
        # Model validation
        if 'model' in data:
            model = str(data['model']).strip()
            if not model or model.lower() == 'unknown':
                warnings.append("Model information is missing or unknown")
        
        # Year validation
        if 'year' in data:
            year = data['year']
            if year:
                try:
                    year_int = int(year)
                    current_year = datetime.now().year
                    if year_int < 1900 or year_int > current_year + 2:
                        errors.append(f"Invalid year: {year}")
                    elif year_int < 1980:
                        warnings.append(f"Very old vehicle year: {year}")
                    validated_data['year'] = year_int
                except (ValueError, TypeError):
                    errors.append(f"Invalid year format: {year}")
        
        # VIN validation
        if 'vin' in data and data['vin']:
            vin = str(data['vin']).upper().strip()
            if not self._validate_vin(vin):
                errors.append(f"Invalid VIN format: {vin}")
            else:
                validated_data['vin'] = vin
        
        # Price validation
        if 'price' in data and data['price']:
            try:
                price = float(data['price'])
                if price < 0:
                    errors.append("Price cannot be negative")
                elif price > 10000000:  # $10M threshold
                    warnings.append(f"Unusually high price: ${price:,.2f}")
                validated_data['price'] = price
            except (ValueError, TypeError):
                errors.append(f"Invalid price format: {data['price']}")
        
        quality_score = self._calculate_quality_score(data, errors, warnings)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            quality_score=quality_score,
            validated_data=validated_data
        )
    
    def validate_duty_rate_data(self, data: Dict[str, Any]) -> ValidationResult:
        """Validate customs duty rate data"""
        errors = []
        warnings = []
        validated_data = data.copy()
        
        # Required field validation
        for field in self.required_fields['duty_rate']:
            if field not in data or data[field] is None:
                errors.append(f"Missing required field: {field}")
        
        # Country validation
        if 'country' in data:
            country = str(data['country']).strip()
            if country not in self.valid_countries:
                close_match = self._find_closest_country(country)
                if close_match:
                    warnings.append(f"Country '{country}' corrected to '{close_match}'")
                    validated_data['country'] = close_match
                else:
                    warnings.append(f"Unknown country: {country}")
        
        # Duty rate validation
        if 'duty_rate_percent' in data:
            try:
                duty_rate = float(data['duty_rate_percent'])
                if duty_rate < 0:
                    errors.append("Duty rate cannot be negative")
                elif duty_rate > 100:
                    warnings.append(f"Unusually high duty rate: {duty_rate}%")
                validated_data['duty_rate_percent'] = duty_rate
            except (ValueError, TypeError):
                errors.append(f"Invalid duty rate format: {data['duty_rate_percent']}")
        
        # HTS/Tariff code validation
        if 'hts_code' in data and data['hts_code']:
            hts_code = str(data['hts_code']).strip()
            if not self._validate_hts_code(hts_code):
                warnings.append(f"Invalid HTS code format: {hts_code}")
        
        # Vehicle category validation
        if 'vehicle_category' in data:
            valid_categories = ['passenger_car', 'truck', 'motorcycle', 'special_vehicle', 'unknown']
            if data['vehicle_category'] not in valid_categories:
                warnings.append(f"Unknown vehicle category: {data['vehicle_category']}")
        
        # Date validation
        if 'effective_date' in data and data['effective_date']:
            if not self._validate_date(data['effective_date']):
                errors.append(f"Invalid effective date: {data['effective_date']}")
        
        quality_score = self._calculate_quality_score(data, errors, warnings)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            quality_score=quality_score,
            validated_data=validated_data
        )
    
    def validate_import_eligibility_data(self, data: Dict[str, Any]) -> ValidationResult:
        """Validate import eligibility data"""
        errors = []
        warnings = []
        validated_data = data.copy()
        
        # Required field validation
        for field in self.required_fields['import_eligibility']:
            if field not in data or not data[field]:
                errors.append(f"Missing required field: {field}")
        
        # Country validation
        if 'country_destination' in data:
            country = str(data['country_destination']).strip()
            if country not in self.valid_countries:
                close_match = self._find_closest_country(country)
                if close_match:
                    warnings.append(f"Country '{country}' corrected to '{close_match}'")
                    validated_data['country_destination'] = close_match
                else:
                    warnings.append(f"Unknown destination country: {country}")
        
        # Regulatory authority validation
        if 'regulatory_authority' in data:
            authority = str(data['regulatory_authority']).strip()
            if authority not in self.regulatory_authorities:
                warnings.append(f"Unknown regulatory authority: {authority}")
        
        # Eligibility status validation
        if 'eligibility_status' in data:
            valid_statuses = ['Eligible', 'Not Eligible', 'Conditional', 'Requires Assessment', 'Unknown']
            status = str(data['eligibility_status']).strip()
            if status not in valid_statuses:
                warnings.append(f"Unknown eligibility status: {status}")
        
        # 25-year rule validation (US specific)
        if data.get('country_destination') == 'United States' and 'twenty_five_year_rule' in data:
            if not isinstance(data['twenty_five_year_rule'], bool):
                errors.append("25-year rule field must be boolean")
        
        quality_score = self._calculate_quality_score(data, errors, warnings)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            quality_score=quality_score,
            validated_data=validated_data
        )
    
    def validate_timeline_data(self, data: Dict[str, Any]) -> ValidationResult:
        """Validate import timeline data"""
        errors = []
        warnings = []
        validated_data = data.copy()
        
        # Required field validation
        for field in self.required_fields['timeline_data']:
            if field not in data or not data[field]:
                errors.append(f"Missing required field: {field}")
        
        # Duration validation
        if 'estimated_duration_days' in data:
            try:
                duration = int(data['estimated_duration_days'])
                if duration < 0:
                    errors.append("Duration cannot be negative")
                elif duration > 730:  # 2 years
                    warnings.append(f"Unusually long duration: {duration} days")
                validated_data['estimated_duration_days'] = duration
            except (ValueError, TypeError):
                errors.append(f"Invalid duration format: {data['estimated_duration_days']}")
        
        # Process step validation
        if 'process_step' in data:
            step = str(data['process_step']).strip()
            if not step:
                errors.append("Process step cannot be empty")
        
        quality_score = self._calculate_quality_score(data, errors, warnings)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            quality_score=quality_score,
            validated_data=validated_data
        )
    
    def _validate_vin(self, vin: str) -> bool:
        """Validate VIN format"""
        if not vin or len(vin) != 17:
            return False
        
        # Check for invalid characters
        invalid_chars = {'I', 'O', 'Q'}
        if any(char in invalid_chars for char in vin.upper()):
            return False
        
        # Basic format check (alphanumeric)
        if not re.match(r'^[A-HJ-NPR-Z0-9]{17}$', vin.upper()):
            return False
        
        return True
    
    def _validate_hts_code(self, hts_code: str) -> bool:
        """Validate HTS code format"""
        # Basic HTS code validation (4-10 digits with possible dots)
        pattern = r'^\d{4}(\.\d{2}){0,3}$'
        return bool(re.match(pattern, hts_code))
    
    def _validate_date(self, date_str: str) -> bool:
        """Validate date format"""
        date_formats = ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d %H:%M:%S']
        
        for fmt in date_formats:
            try:
                datetime.strptime(str(date_str), fmt)
                return True
            except ValueError:
                continue
        
        return False
    
    def _find_closest_make(self, make: str) -> Optional[str]:
        """Find closest matching vehicle make"""
        make_lower = make.lower()
        
        # Direct partial matches
        for valid_make in self.valid_makes:
            if make_lower in valid_make.lower() or valid_make.lower() in make_lower:
                return valid_make
        
        # Common misspellings/variations
        make_mappings = {
            'toyota': 'Toyota',
            'honda': 'Honda',
            'nissan': 'Nissan',
            'bmw': 'BMW',
            'mercedes': 'Mercedes-Benz',
            'mercedes-benz': 'Mercedes-Benz',
            'audi': 'Audi',
            'volkswagen': 'Volkswagen',
            'vw': 'Volkswagen',
            'porsche': 'Porsche',
            'ford': 'Ford',
            'chevrolet': 'Chevrolet',
            'chevy': 'Chevrolet',
            'subaru': 'Subaru',
            'mitsubishi': 'Mitsubishi',
            'mazda': 'Mazda'
        }
        
        return make_mappings.get(make_lower)
    
    def _find_closest_country(self, country: str) -> Optional[str]:
        """Find closest matching country name"""
        country_lower = country.lower()
        
        # Direct partial matches
        for valid_country in self.valid_countries:
            if country_lower in valid_country.lower() or valid_country.lower() in country_lower:
                return valid_country
        
        # Common variations
        country_mappings = {
            'usa': 'United States',
            'us': 'United States',
            'america': 'United States',
            'uk': 'United Kingdom',
            'britain': 'United Kingdom',
            'england': 'United Kingdom',
            'australia': 'Australia',
            'canada': 'Canada',
            'japan': 'Japan',
            'germany': 'Germany',
            'france': 'France',
            'italy': 'Italy'
        }
        
        return country_mappings.get(country_lower)
    
    def _calculate_quality_score(self, data: Dict[str, Any], errors: List[str], warnings: List[str]) -> float:
        """Calculate data quality score (0-1)"""
        if errors:
            return 0.0
        
        # Start with base score
        score = 1.0
        
        # Reduce score for warnings
        score -= len(warnings) * 0.1
        
        # Reduce score for missing optional fields
        total_fields = len(data)
        empty_fields = sum(1 for v in data.values() if not v)
        if total_fields > 0:
            completeness = (total_fields - empty_fields) / total_fields
            score *= completeness
        
        # Ensure score is between 0 and 1
        return max(0.0, min(1.0, score))
    
    def validate_batch(self, data_list: List[Dict[str, Any]], data_type: str) -> List[ValidationResult]:
        """Validate a batch of data records"""
        results = []
        
        validation_methods = {
            'vehicle': self.validate_vehicle_data,
            'duty_rate': self.validate_duty_rate_data,
            'import_eligibility': self.validate_import_eligibility_data,
            'timeline_data': self.validate_timeline_data
        }
        
        validate_method = validation_methods.get(data_type)
        if not validate_method:
            raise ValueError(f"Unknown data type: {data_type}")
        
        for i, record in enumerate(data_list):
            try:
                result = validate_method(record)
                results.append(result)
            except Exception as e:
                self.logger.error(f"Error validating record {i}: {str(e)}")
                results.append(ValidationResult(
                    is_valid=False,
                    errors=[f"Validation error: {str(e)}"],
                    warnings=[],
                    quality_score=0.0,
                    validated_data=record
                ))
        
        return results
    
    def get_validation_summary(self, results: List[ValidationResult]) -> Dict[str, Any]:
        """Get summary of validation results"""
        total = len(results)
        valid = sum(1 for r in results if r.is_valid)
        total_errors = sum(len(r.errors) for r in results)
        total_warnings = sum(len(r.warnings) for r in results)
        avg_quality = sum(r.quality_score for r in results) / total if total > 0 else 0
        
        return {
            'total_records': total,
            'valid_records': valid,
            'invalid_records': total - valid,
            'validation_rate': valid / total if total > 0 else 0,
            'total_errors': total_errors,
            'total_warnings': total_warnings,
            'average_quality_score': avg_quality,
            'quality_grade': self._get_quality_grade(avg_quality)
        }
    
    def _get_quality_grade(self, score: float) -> str:
        """Convert quality score to letter grade"""
        if score >= 0.9:
            return 'A'
        elif score >= 0.8:
            return 'B'
        elif score >= 0.7:
            return 'C'
        elif score >= 0.6:
            return 'D'
        else:
            return 'F'