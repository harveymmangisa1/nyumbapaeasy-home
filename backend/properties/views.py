from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Property, PropertyInquiry, PropertyView
from .serializers import PropertySerializer, PropertyInquirySerializer

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'price_type', 'bedrooms', 'bathrooms', 'agent', 'is_featured', 'is_verified']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['price', 'created_at', 'rating', 'area']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        # Auto-assign agent if user has an agent profile
        agent = None
        if self.request.user.is_authenticated:
            try:
                from agents.models import Agent
                agent, created = Agent.objects.get_or_create(user=self.request.user)
            except Exception:
                pass

        # Handle uploaded images
        from django.core.files.storage import default_storage
        from django.conf import settings
        import json
        
        uploaded_images = self.request.FILES.getlist('uploaded_images')
        image_urls = []
        for image_file in uploaded_images:
            file_name = default_storage.save(f'properties/{image_file.name}', image_file)
            file_url = f"{settings.MEDIA_URL}{file_name}"
            # Ensure URL is absolute or at least consistent
            image_urls.append(file_url)
            
        # Handle amenities if sent as JSON string
        amenities = self.request.data.get('amenities')
        if isinstance(amenities, str):
            try:
                amenities = json.loads(amenities)
            except json.JSONDecodeError:
                pass

        serializer.save(
            agent=agent, 
            images=image_urls if image_urls else serializer.validated_data.get('images', []),
            amenities=amenities if amenities else serializer.validated_data.get('amenities', [])
        )

    def get_queryset(self):
        queryset = Property.objects.filter(is_available=True)
        
        # Featured filtering
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        elif featured == 'false':
            queryset = queryset.filter(is_featured=False)

        # Price range filtering
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        # Area range filtering
        min_area = self.request.query_params.get('min_area')
        max_area = self.request.query_params.get('max_area')
        if min_area:
            queryset = queryset.filter(area__gte=min_area)
        if max_area:
            queryset = queryset.filter(area__lte=max_area)
            
        return queryset

    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        from django.utils import timezone
        from datetime import timedelta
        
        property_obj = self.get_object()
        days = int(request.data.get('days', 7))
        
        property_obj.is_featured = True
        property_obj.featured_until = timezone.now() + timedelta(days=days)
        property_obj.save()
        
        return Response({
            'status': 'property promoted',
            'featured_until': property_obj.featured_until
        })
    
    @action(detail=True, methods=['post'])
    def track_view(self, request, pk=None):
        property_obj = self.get_object()
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        PropertyView.objects.get_or_create(
            property=property_obj,
            ip_address=ip_address,
            defaults={'user_agent': user_agent}
        )
        
        return Response({'status': 'view tracked'})
    
    @action(detail=True, methods=['post'])
    def inquire(self, request, pk=None):
        property_obj = self.get_object()
        serializer = PropertyInquirySerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(property=property_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class PropertyInquiryViewSet(viewsets.ModelViewSet):
    queryset = PropertyInquiry.objects.all()
    serializer_class = PropertyInquirySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['property', 'status']
    ordering = ['-created_at']
