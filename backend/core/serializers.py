from rest_framework import serializers
from .models import User, Genre, Book, UserBookshelf, Club, ClubMember, Meeting, News

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name','avatar_url']

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']

class BookSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'cover_image_url', 'description', 'genres']

class UserBookshelfSerializer(serializers.ModelSerializer):
    book_details = BookSerializer(source='book', read_only=True)
    
    class Meta:
        model = UserBookshelf
        fields = ['id', 'user', 'book', 'book_details', 'status', 'added_at']
        read_only_fields = ['user']

class ClubMemberSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ClubMember
        fields = ['id', 'user', 'username', 'user_details', 'club', 'role', 'joined_at']

class ClubSerializer(serializers.ModelSerializer):
    creator_details = UserSerializer(source='creator', read_only=True)
    genres_details = GenreSerializer(source='genres', many=True, read_only=True)
    format_display = serializers.CharField(source='get_format_display', read_only=True)
    
    members_count = serializers.SerializerMethodField()
    next_meeting = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    currently_reading = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    books = BookSerializer(many=True, read_only=True) 
    
    book_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Book.objects.all(), source='books', write_only=True, required=False
    )

    members_details = ClubMemberSerializer(source='clubmember_set', many=True, read_only=True)

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'description', 'format', 'format_display', 'is_private', 
            'creator', 'creator_details', 'genres', 'genres_details',
            'members_count', 'next_meeting', 'location', 'currently_reading',
            'custom_design', 'user_role', 'books', 'book_ids',
            'members_details'
        ]

    def get_members_count(self, obj):
        return obj.clubmember_set.count()

    def get_next_meeting(self, obj):
        meeting = obj.meetings.order_by('scheduled_at').first()
        if meeting:
            return meeting.scheduled_at.strftime('%d.%m.%Y %H:%M')
        return "Не заплановано"

    def get_location(self, obj):
        meeting = obj.meetings.order_by('scheduled_at').first()
        if meeting:
            return meeting.location_details
        return "Уточнюється"

    def get_currently_reading(self, obj):
        meeting = obj.meetings.order_by('scheduled_at').first()
        if meeting and meeting.book:
            return meeting.book.title
        return "Обираємо книгу"

    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = obj.clubmember_set.filter(user=request.user).first()
            if member:
                return member.role
        return None

class MeetingSerializer(serializers.ModelSerializer):
    book_details = BookSerializer(source='book', read_only=True)

    class Meta:
        model = Meeting
        fields = ['id', 'club', 'book', 'book_details', 'topic', 'scheduled_at', 'format', 'location_details']

class NewsSerializer(serializers.ModelSerializer):
    date = serializers.DateField(source='date_published', format='%B %d, %Y', read_only=True)
    
    class Meta:
        model = News
        fields = ['id', 'title', 'summary', 'content', 'date']