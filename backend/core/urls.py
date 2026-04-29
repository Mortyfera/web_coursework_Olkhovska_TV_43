from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, GenreViewSet, BookViewSet, 
    UserBookshelfViewSet, ClubViewSet, ClubMemberViewSet, MeetingViewSet,
    NewsViewSet, login_view, register_view
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'genres', GenreViewSet)
router.register(r'books', BookViewSet)
router.register(r'bookshelf', UserBookshelfViewSet)
router.register(r'clubs', ClubViewSet)
router.register(r'members', ClubMemberViewSet)
router.register(r'meetings', MeetingViewSet)
router.register(r'news', NewsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
]