from django.contrib import admin

from .models import Achievement, AchievementCat, Cat


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Cat)
class CatAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "color", "birth_year", "owner")
    list_filter = ("birth_year", "owner")
    search_fields = ("name", "owner__username")


@admin.register(AchievementCat)
class AchievementCatAdmin(admin.ModelAdmin):
    list_display = ("id", "achievement", "cat")
    list_filter = ("achievement",)
    search_fields = ("achievement__name", "cat__name")
