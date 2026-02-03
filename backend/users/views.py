from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token
from .models import CustomUser
from .serializers import CustomUserSerializer, UserRegistrationSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return CustomUserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if not user and username:
            lookup_user = CustomUser.objects.filter(email=username).first()
            if lookup_user:
                user = authenticate(request, username=lookup_user.username, password=password)
        
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            serializer = self.get_serializer(user)
            return Response({
                'token': token.key,
                'user': serializer.data,
                'status': 'success'
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        if request.user.is_authenticated:
            Token.objects.filter(user=request.user).delete()
        logout(request)
        return Response({'status': 'success'})
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        from properties.models import Property, PropertyInquiry, PropertyView
        properties_qs = Property.objects.filter(owner=request.user)

        total_properties = properties_qs.count()
        active_listings = properties_qs.filter(is_available=True).count()
        total_views = PropertyView.objects.filter(property__in=properties_qs).count()
        total_inquiries = PropertyInquiry.objects.filter(property__in=properties_qs).count()

        return Response({
            'total_properties': total_properties,
            'active_listings': active_listings,
            'total_views': total_views,
            'total_inquiries': total_inquiries
        })

    @action(detail=False, methods=['post'])
    def upload_verification(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        from .models import VerificationDocument
        from .serializers import VerificationDocumentSerializer
        
        serializer = VerificationDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
