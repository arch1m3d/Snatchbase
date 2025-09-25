"""Service for searching and filtering stealer log data"""
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, desc
from typing import List, Optional
from app.models import Credential, System, Upload
from app.schemas import CredentialResponse, SystemResponse, StatisticsResponse, DomainStatistic, CountryStatistic, StealerStatistic

class SearchService:
    """Service for searching stealer log data"""
    
    def search_credentials(
        self,
        db: Session,
        query: Optional[str] = None,
        domain: Optional[str] = None,
        username: Optional[str] = None,
        software: Optional[str] = None,
        stealer_name: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[CredentialResponse]:
        """Search credentials with filters"""
        
        # Start with base query
        query_obj = db.query(Credential)
        
        # Apply filters
        filters = []
        
        if query:
            # Full-text search across multiple fields
            search_filter = or_(
                Credential.username.ilike(f"%{query}%"),
                Credential.domain.ilike(f"%{query}%"),
                Credential.host.ilike(f"%{query}%"),
                Credential.software.ilike(f"%{query}%"),
                Credential.email_domain.ilike(f"%{query}%")
            )
            filters.append(search_filter)
        
        if domain:
            filters.append(or_(
                Credential.domain.ilike(f"%{domain}%"),
                Credential.email_domain.ilike(f"%{domain}%")
            ))
        
        if username:
            filters.append(or_(
                Credential.username.ilike(f"%{username}%"),
                Credential.local_part.ilike(f"%{username}%")
            ))
        
        if software:
            filters.append(Credential.software.ilike(f"%{software}%"))
        
        if stealer_name:
            filters.append(Credential.stealer_name.ilike(f"%{stealer_name}%"))
        
        # Apply all filters
        if filters:
            query_obj = query_obj.filter(and_(*filters))
        
        # Order by creation date (newest first)
        query_obj = query_obj.order_by(desc(Credential.created_at))
        
        # Apply pagination
        credentials = query_obj.offset(offset).limit(limit).all()
        
        return [CredentialResponse.from_orm(cred) for cred in credentials]
    
    def search_credentials_with_count(
        self,
        db: Session,
        query: Optional[str] = None,
        domain: Optional[str] = None,
        username: Optional[str] = None,
        software: Optional[str] = None,
        stealer_name: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> tuple[List[CredentialResponse], int]:
        """Search credentials with filters and return total count"""
        
        # Start with base query
        base_query = db.query(Credential)
        
        # Apply filters
        filters = []
        
        if query:
            # Full-text search across multiple fields
            search_filter = or_(
                Credential.username.ilike(f"%{query}%"),
                Credential.domain.ilike(f"%{query}%"),
                Credential.host.ilike(f"%{query}%"),
                Credential.software.ilike(f"%{query}%"),
                Credential.email_domain.ilike(f"%{query}%")
            )
            filters.append(search_filter)
        
        if domain:
            filters.append(or_(
                Credential.domain.ilike(f"%{domain}%"),
                Credential.email_domain.ilike(f"%{domain}%")
            ))
        
        if username:
            filters.append(or_(
                Credential.username.ilike(f"%{username}%"),
                Credential.local_part.ilike(f"%{username}%")
            ))
        
        if software:
            filters.append(Credential.software.ilike(f"%{software}%"))
        
        if stealer_name:
            filters.append(Credential.stealer_name.ilike(f"%{stealer_name}%"))
        
        # Apply all filters
        if filters:
            base_query = base_query.filter(and_(*filters))
        
        # Get total count
        total = base_query.count()
        
        # Apply ordering and pagination for results
        credentials = base_query.order_by(desc(Credential.created_at)).offset(offset).limit(limit).all()
        
        return [CredentialResponse.from_orm(cred) for cred in credentials], total
    
    def search_systems(
        self,
        db: Session,
        query: Optional[str] = None,
        country: Optional[str] = None,
        ip_address: Optional[str] = None,
        computer_name: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[SystemResponse]:
        """Search systems with filters"""
        
        # Start with base query
        query_obj = db.query(System)
        
        # Apply filters
        filters = []
        
        if query:
            # Full-text search across multiple fields
            search_filter = or_(
                System.computer_name.ilike(f"%{query}%"),
                System.machine_user.ilike(f"%{query}%"),
                System.ip_address.ilike(f"%{query}%"),
                System.country.ilike(f"%{query}%"),
                System.machine_id.ilike(f"%{query}%")
            )
            filters.append(search_filter)
        
        if country:
            filters.append(System.country.ilike(f"%{country}%"))
        
        if ip_address:
            filters.append(System.ip_address.ilike(f"%{ip_address}%"))
        
        if computer_name:
            filters.append(System.computer_name.ilike(f"%{computer_name}%"))
        
        # Apply all filters
        if filters:
            query_obj = query_obj.filter(and_(*filters))
        
        # Order by creation date (newest first)
        query_obj = query_obj.order_by(desc(System.created_at))
        
        # Apply pagination
        systems = query_obj.offset(offset).limit(limit).all()
        
        return [SystemResponse.from_orm(sys) for sys in systems]
    
    def search_systems_with_count(
        self,
        db: Session,
        query: Optional[str] = None,
        country: Optional[str] = None,
        ip_address: Optional[str] = None,
        computer_name: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> tuple[List[SystemResponse], int]:
        """Search systems with filters and return total count"""
        
        # Start with base query
        base_query = db.query(System)
        
        # Apply filters
        filters = []
        
        if query:
            # Full-text search across multiple fields
            search_filter = or_(
                System.computer_name.ilike(f"%{query}%"),
                System.machine_user.ilike(f"%{query}%"),
                System.ip_address.ilike(f"%{query}%"),
                System.country.ilike(f"%{query}%"),
                System.machine_id.ilike(f"%{query}%")
            )
            filters.append(search_filter)
        
        if country:
            filters.append(System.country.ilike(f"%{country}%"))
        
        if ip_address:
            filters.append(System.ip_address.ilike(f"%{ip_address}%"))
        
        if computer_name:
            filters.append(System.computer_name.ilike(f"%{computer_name}%"))
        
        # Apply all filters
        if filters:
            base_query = base_query.filter(and_(*filters))
        
        # Get total count
        total = base_query.count()
        
        # Apply ordering and pagination for results
        systems = base_query.order_by(desc(System.created_at)).offset(offset).limit(limit).all()
        
        return [SystemResponse.from_orm(sys) for sys in systems], total
    
    def get_statistics(self, db: Session) -> StatisticsResponse:
        """Get overall database statistics"""
        
        total_credentials = db.query(func.count(Credential.id)).scalar()
        total_systems = db.query(func.count(System.id)).scalar()
        total_uploads = db.query(func.count(Upload.id)).scalar()
        
        unique_domains = db.query(func.count(func.distinct(Credential.domain))).scalar()
        unique_countries = db.query(func.count(func.distinct(System.country))).scalar()
        unique_stealers = db.query(func.count(func.distinct(Credential.stealer_name))).scalar()
        
        return StatisticsResponse(
            total_credentials=total_credentials or 0,
            total_systems=total_systems or 0,
            total_uploads=total_uploads or 0,
            unique_domains=unique_domains or 0,
            unique_countries=unique_countries or 0,
            unique_stealers=unique_stealers or 0
        )
    
    def get_domain_statistics(self, db: Session, limit: int = 20) -> List[DomainStatistic]:
        """Get top domains by credential count"""
        
        results = db.query(
            Credential.domain,
            func.count(Credential.id).label('count')
        ).filter(
            Credential.domain.isnot(None),
            Credential.domain != ''
        ).group_by(
            Credential.domain
        ).order_by(
            desc('count')
        ).limit(limit).all()
        
        return [DomainStatistic(domain=domain, count=count) for domain, count in results]
    
    def get_country_statistics(self, db: Session, limit: int = 20) -> List[CountryStatistic]:
        """Get top countries by system count"""
        
        results = db.query(
            System.country,
            func.count(System.id).label('count')
        ).filter(
            System.country.isnot(None),
            System.country != ''
        ).group_by(
            System.country
        ).order_by(
            desc('count')
        ).limit(limit).all()
        
        return [CountryStatistic(country=country, count=count) for country, count in results]
    
    def get_stealer_statistics(self, db: Session, limit: int = 20) -> List[StealerStatistic]:
        """Get top stealers by credential count"""
        
        results = db.query(
            Credential.stealer_name,
            func.count(Credential.id).label('count')
        ).filter(
            Credential.stealer_name.isnot(None),
            Credential.stealer_name != ''
        ).group_by(
            Credential.stealer_name
        ).order_by(
            desc('count')
        ).limit(limit).all()
        
        return [StealerStatistic(stealer_name=stealer_name, count=count) for stealer_name, count in results]
