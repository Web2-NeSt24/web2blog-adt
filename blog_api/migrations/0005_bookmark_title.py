# Generated by Django 5.2.1 on 2025-05-29 11:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog_api', '0004_post_draft_like_comment_bookmark_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='bookmark',
            name='title',
            field=models.TextField(blank=True),
        ),
    ]
