from rest_framework.decorators import api_view, permission_classes
from rest_framework import filters
from rest_framework import permissions
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import User, Genre, Book, UserBookshelf, Club, ClubMember, Meeting, News
from .serializers import (
    UserSerializer, GenreSerializer, BookSerializer, 
    UserBookshelfSerializer, ClubSerializer, ClubMemberSerializer, MeetingSerializer, NewsSerializer
)

class IsClubAdminOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        is_creator = obj.creator == request.user
        is_admin = obj.clubmember_set.filter(user=request.user, role='AD').exists()
        
        return is_creator or is_admin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author']

class UserBookshelfViewSet(viewsets.ModelViewSet):
    queryset = UserBookshelf.objects.all()
    serializer_class = UserBookshelfSerializer
    
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [IsClubAdminOrReadOnly]

class ClubMemberViewSet(viewsets.ModelViewSet):
    queryset = ClubMember.objects.all()
    serializer_class = ClubMemberSerializer

class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all().order_by('-date_published')
    serializer_class = NewsSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username})
    return Response({'error': 'Неправильний логін або пароль'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Користувач з таким іменем вже існує'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'username': user.username})