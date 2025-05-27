from django.db import models
from django.contrib.auth.models import User
from django.db.models.base import post_save
from django.dispatch import receiver

class Image(models.Model):
    class ImageType(models.TextChoices):
        PNG = "PNG"
        JPEG = "JPEG"
        SVG = "SVG"

    type = models.CharField(max_length=4, choices=ImageType.choices)
    data = models.BinaryField()

    def __str__(self):
        return f"Image(type={self.type}, size={len(self.data)})"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    biography = models.TextField(blank=True)
    profile_picture = models.ForeignKey(Image, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return str(self.user)

@receiver(post_save, sender=User)
def create_user_profile(instance: User, created: bool, **_):
    if created:
        Profile(user=instance).save()


class Hashtag(models.Model):
    value = models.TextField(unique=True)

    def __str__(self):
        return f"#{self.value}"

class Post(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    title = models.TextField(blank=False)
    content = models.TextField(blank=True)
    image = models.ForeignKey(Image, null=True, blank=True, on_delete=models.SET_NULL)
    tags = models.ManyToManyField(Hashtag, blank=True)
    draft = models.BooleanField(default=False)

    def __str__(self):
        return f"Post(profile={self.profile}, title={self.title})"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author_profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.TextField()

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    liker_profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    class Meta:
        constraints = [models.UniqueConstraint(
            "post_id",
            "liker_profile_id",
            name="blog_api_unique_like"
        )]

class Bookmark(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    creator_profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    class Meta:
        constraints = [models.UniqueConstraint(
            "post_id",
            "creator_profile_id",
            name="blog_api_unique_bookmark"
        )]

