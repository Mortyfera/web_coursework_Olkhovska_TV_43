from rest_framework.decorators import api_view, permission_classes, action
from rest_framework import filters
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly
import random
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
from .models import User, Genre, Book, UserBookshelf, Club, ClubMember, Meeting, News, JoinRequest
from .serializers import (
    UserSerializer, GenreSerializer, BookSerializer, 
    UserBookshelfSerializer, ClubSerializer, ClubMemberSerializer, MeetingSerializer, NewsSerializer, JoinRequestSerializer
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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsClubAdminOrReadOnly]

    def perform_create(self, serializer):
        club = serializer.save(creator=self.request.user)
        ClubMember.objects.create(
            user=self.request.user,
            club=club,
            role=ClubMember.RoleChoices.ADMIN
        )

    @action(detail=True, methods=['post'], url_path='join', permission_classes=[permissions.IsAuthenticated])
    def join_club(self, request, pk=None):
        club = self.get_object()
        user = request.user

        if ClubMember.objects.filter(club=club, user=user).exists():
            return Response({"error": "Ви вже є учасником цього клубу."}, status=status.HTTP_400_BAD_REQUEST)

        if not club.is_private:
            ClubMember.objects.create(user=user, club=club, role='MB')
            return Response({"status": "Ви успішно приєдналися до клубу!"}, status=status.HTTP_201_CREATED)
        else:
            join_req, created = JoinRequest.objects.get_or_create(
                user=user, 
                club=club, 
                defaults={'status': JoinRequest.StatusChoices.PENDING}
            )
            if not created:
                if join_req.status == JoinRequest.StatusChoices.PENDING:
                    return Response({"error": "Заявку вже було надіслано раніше."}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    join_req.status = JoinRequest.StatusChoices.PENDING
                    join_req.save()
            
            return Response({"status": "Заявку на вступ надіслано! Очікуйте підтвердження."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path=r'requests/(?P<request_id>\d+)/process')
    def process_join_request(self, request, pk=None, request_id=None):
        club = self.get_object()
        join_req = get_object_or_404(JoinRequest, id=request_id, club=club)
        action_choice = request.data.get('action')

        if action_choice == 'accept':
            join_req.status = JoinRequest.StatusChoices.ACCEPTED
            join_req.save()
            ClubMember.objects.get_or_create(user=join_req.user, club=club, role='MB')
            
            if join_req.user.email:
                send_mail(
                    subject=f"Заявку до клубу '{club.name}' схвалено!",
                    message=f"Вітаємо, {join_req.user.username}!\n\nВашу заявку на вступ до книжкового клубу '{club.name}' було ухвалено. Тепер ви повноправний учасник!\n\nПриємного читання з MarginNotes!",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[join_req.user.email],
                    fail_silently=True,
                )

            return Response({"status": "Заявку прийнято, користувача додано."})
        
        elif action_choice == 'reject':
            join_req.status = JoinRequest.StatusChoices.REJECTED
            join_req.save()
            
            if join_req.user.email:
                send_mail(
                    subject=f"Заявку до клубу '{club.name}' відхилено",
                    message=f"Вітаємо, {join_req.user.username}.\n\nНа жаль, адміністратор клубу '{club.name}' відхилив вашу заявку на вступ.\n\nНе засмучуйтесь, на платформі є ще багато інших цікавих клубів!",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[join_req.user.email],
                    fail_silently=True,
                )

            return Response({"status": "Заявку відхилено."})
        
        return Response({"error": "Невідома дія. Використовуйте 'accept' або 'reject'."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path=r'members/(?P<member_id>\d+)/promote')
    def promote_member(self, request, pk=None, member_id=None):
        club = self.get_object()
        if club.creator != request.user:
             return Response({"detail": "Тільки власник може призначати адміністраторів."}, status=status.HTTP_403_FORBIDDEN)

        member = get_object_or_404(ClubMember, id=member_id, club=club)
        member.role = 'AD' 
        member.save()
        return Response({"status": "Учасника підвищено до адміністратора"})

    @action(detail=True, methods=['post'], url_path=r'members/(?P<member_id>\d+)/demote')
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
    
    link = f"http://localhost:5173/activate/{uid}/{token}/"

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
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not user.check_password(old_password):
        return Response({'error': 'Старий пароль введено неправильно.'}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Пароль успішно змінено!'})

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_recommendations(request):
    if request.user.is_authenticated:
        user_bookshelf_ids = UserBookshelf.objects.filter(user=request.user).values_list('book_id', flat=True)
        
        favorite_genres = request.user.favorite_genres.all()
        
        available_books = Book.objects.exclude(id__in=user_bookshelf_ids)
        
        recommended_books = []
        
        if favorite_genres.exists():
            genre_matched_books = available_books.filter(genres__in=favorite_genres).distinct()
            recommended_books = list(genre_matched_books)
        
        random.shuffle(recommended_books)
        
        if len(recommended_books) < 3:
            needed = 3 - len(recommended_books)
            exclude_ids = [book.id for book in recommended_books]
            extra_books = list(available_books.exclude(id__in=exclude_ids))
            random.shuffle(extra_books)
            recommended_books.extend(extra_books[:needed])
            
        final_recommendations = recommended_books[:3]
    else:
        books = list(Book.objects.all())
        random.shuffle(books)
        final_recommendations = books[:3]

    serializer = BookSerializer(final_recommendations, many=True)
    return Response(serializer.data)