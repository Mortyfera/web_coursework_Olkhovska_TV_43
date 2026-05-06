from rest_framework.decorators import api_view, permission_classes, action
from rest_framework import filters
from rest_framework import permissions
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.shortcuts import get_object_or_404
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

    @action(detail=True, methods=['post'], url_path='members/(?P<member_id>\d+)/promote')
    def promote_member(self, request, pk=None, member_id=None):
        club = self.get_object()
        
        if club.creator != request.user:
             return Response({"detail": "Тільки власник може призначати адміністраторів."}, status=status.HTTP_403_FORBIDDEN)

        member = get_object_or_404(ClubMember, id=member_id, club=club)
        
        member.role = 'AD' 
        member.save()

        return Response({"status": "Учасника підвищено до адміністратора"})

    @action(detail=True, methods=['post'], url_path='members/(?P<member_id>\d+)/demote')
    def demote_member(self, request, pk=None, member_id=None):
        club = self.get_object()
        
        if club.creator != request.user:
             return Response({"detail": "Тільки власник може забирати права адміністраторів."}, status=status.HTTP_403_FORBIDDEN)

        member = get_object_or_404(ClubMember, id=member_id, club=club)
        
        if member.user == club.creator:
             return Response({"detail": "Власника клубу не можна понизити."}, status=status.HTTP_400_BAD_REQUEST)

        member.role = 'MB' 
        member.save()

        return Response({"status": "Права адміністратора знято"})

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

    try:
        user_check = User.objects.get(username=username)
        if not user_check.is_active:
            return Response({
                'error': 'Ваш акаунт не активовано. Будь ласка, перевірте вашу пошту (і папку Спам) та перейдіть за посиланням.'
            }, status=403)
    except User.DoesNotExist:
        pass

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

    if not email.endswith('@gmail.com'):
        return Response({'error': 'Дозволена реєстрація тільки через @gmail.com'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Користувач з такою поштою вже існує'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_active = False 
    user.save()

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    link = f"http://localhost:5174/activate/{uid}/{token}/"

    subject = 'Підтвердження реєстрації — MarginNotes'
    message = f"Вітаємо! Для завершення реєстрації та активації акаунта перейдіть за посиланням: {link}"
    
    try:
        send_mail(
            subject, 
            message, 
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return Response({'message': 'Лист для підтвердження відправлено! Перевірте вашу пошту.'})
    except Exception as e:
        user.delete()
        return Response({'error': 'Не вдалося відправити лист. Перевірте правильність пошти.'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def activate_user(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({'status': 'Акаунт активовано! Тепер ви можете увійти.'})
    else:
        return Response({'error': 'Посилання недійсне або термін його дії закінчився'}, status=400)