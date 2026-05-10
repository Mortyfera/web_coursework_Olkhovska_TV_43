from django.db import models
from ckeditor.fields import RichTextField
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    avatar_url = models.URLField(blank=True, null=True, verbose_name="Аватар")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Аватар (файл)")
    favorite_genres = models.ManyToManyField('Genre', related_name='favorited_by_users', blank=True)

class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Назва жанру")

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, blank=True, null=True)
    cover_image_url = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True, help_text="Короткий опис книги")
    genres = models.ManyToManyField('Genre', related_name='books', blank=True)

    def __str__(self):
        return self.title

class UserBookshelf(models.Model):
    class StatusChoices(models.TextChoices):
        READ = 'RD', 'Прочитано'
        READING = 'RG', 'Читаю'
        TO_READ = 'TR', 'У планах'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookshelf")
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    status = models.CharField(max_length=2, choices=StatusChoices.choices, default=StatusChoices.TO_READ)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')

class Club(models.Model):
    class FormatChoices(models.TextChoices):
        ONLINE = 'ON', 'Онлайн'
        OFFLINE = 'OF', 'Офлайн'
        HYBRID = 'HY', 'Гібрид'

    name = models.CharField(max_length=255, verbose_name="Назва клубу")
    description = models.TextField(verbose_name="Опис")
    format = models.CharField(max_length=2, choices=FormatChoices.choices, default=FormatChoices.ONLINE)
    is_private = models.BooleanField(default=False)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="created_clubs")
    genres = models.ManyToManyField(Genre, related_name="clubs")
    custom_design = models.JSONField(blank=True, null=True, verbose_name="Кастомний дизайн")
    books = models.ManyToManyField('Book', related_name='clubs', blank=True, verbose_name="Книги клубу")
    currently_reading = models.CharField(max_length=255, blank=True, null=True, verbose_name="Поточна книга")

    def __str__(self):
        return self.name


class JoinRequest(models.Model):
    class StatusChoices(models.TextChoices):
        PENDING = 'PE', 'В очікуванні'
        ACCEPTED = 'AC', 'Прийнято'
        REJECTED = 'RE', 'Відхилено'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="club_join_requests")
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="join_requests_list")
    status = models.CharField(max_length=2, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'club')

    def __str__(self):
        return f"{self.user.username} -> {self.club.name} ({self.get_status_display()})"

class ClubMember(models.Model):
    class RoleChoices(models.TextChoices):
        ADMIN = 'AD', 'Адміністратор'
        MEMBER = 'MB', 'Учасник'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    role = models.CharField(max_length=2, choices=RoleChoices.choices, default=RoleChoices.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

class Meeting(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="meetings")
    book = models.ForeignKey(Book, on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.CharField(max_length=255)
    scheduled_at = models.DateTimeField()
    format = models.CharField(max_length=2, choices=Club.FormatChoices.choices, default=Club.FormatChoices.ONLINE)
    location_details = models.TextField(help_text="Лінк на Zoom або фізична адреса")

    def __str__(self):
        return f"{self.topic} ({self.club.name})"
    
class News(models.Model):
    title = models.CharField(max_length=255)
    summary = models.TextField()
    date_published = models.DateField(auto_now_add=True)
    content = RichTextField(blank=True, null=True, help_text="Повний текст статті")

    class Meta:
        verbose_name = "News"
        verbose_name_plural = "News"

    def __str__(self):
        return self.title
    
class Poll(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='polls')
    title = models.CharField(max_length=200)
    deadline = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    winner_book = models.ForeignKey('Book', null=True, blank=True, on_delete=models.SET_NULL)

class PollOption(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    book = models.ForeignKey('Book', on_delete=models.CASCADE)
    
class Vote(models.Model):
    poll_option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('poll_option', 'user')