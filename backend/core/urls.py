from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from . import views

from .views import (
    UserViewSet, GenreViewSet, BookViewSet, 
    UserBookshelfViewSet, ClubViewSet, ClubMemberViewSet, MeetingViewSet,
    NewsViewSet, login_view, register_view, activate_user, change_password
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
    path('change-password/', change_password, name='change_password'),
    path('recommendations/', views.get_recommendations, name='get_recommendations'),

    path('activate/<str:uidb64>/<str:token>/', activate_user, name='activate_user'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)