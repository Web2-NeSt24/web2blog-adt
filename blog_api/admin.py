from django.contrib import admin

from blog_api import models

# Register your models here.
admin.site.register(models.Image)
admin.site.register(models.Profile)
admin.site.register(models.Hashtag)
admin.site.register(models.Post)
admin.site.register(models.Comment)
admin.site.register(models.Like)
admin.site.register(models.Bookmark)
