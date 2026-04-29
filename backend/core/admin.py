from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Genre, Book, UserBookshelf, Club, ClubMember, Meeting, News

admin.site.register(User, UserAdmin)
admin.site.register(Genre)
admin.site.register(Book)
admin.site.register(UserBookshelf)
admin.site.register(Club)
admin.site.register(ClubMember)
admin.site.register(Meeting)
admin.site.register(News)