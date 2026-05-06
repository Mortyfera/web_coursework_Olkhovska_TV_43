from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Genre, Book, UserBookshelf, Club, ClubMember, Meeting, News, Poll, PollOption, Vote

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Додаткова інформація', {'fields': ('avatar', 'avatar_url')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Додаткова інформація', {'fields': ('avatar', 'avatar_url')}),
    )

admin.site.register(Genre)
admin.site.register(Book)
admin.site.register(UserBookshelf)
admin.site.register(Club)
admin.site.register(ClubMember)
admin.site.register(Meeting)
admin.site.register(News)
admin.site.register(Poll)
admin.site.register(PollOption)
admin.site.register(Vote)