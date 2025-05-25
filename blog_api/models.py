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
    biography = models.TextField()
    profile_picture = models.ForeignKey(Image, null=True, on_delete=models.SET_NULL)

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
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.TextField()
    content = models.TextField()
    image = models.ForeignKey(Image, null=True, on_delete=models.SET_NULL)
    tags = models.ManyToManyField(Hashtag)

    def __str__(self):
        return f"Post(author={self.author}, title={self.title})"
